<script lang="ts" setup>
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

definePageMeta({
    layout: "admin",
    middleware: "auth",
});
const supabase = useSupabaseClient();
const user = useSupabaseUser();

interface Identity {
    first_name?: string;
    last_name?: string;
    grade?: string;
}

interface DBID extends Identity {
    id: number;
    created_at: string;
    votes: DBVote;
}

interface DBVote {
    id: number;
    voter_id: number;
    vote: string[];
    ip: string;
    people?: DBID;
}

const loading = ref(false);
const query = ref("");
const people = ref<DBID[]>([]);
const votes = ref<DBVote[]>([]);

const votedMode = ref(false);

const refreshList = async () => {
    loading.value = true;
    const { data: peopleFetched } = await supabase
        .from("people")
        .select("*, votes (*)");
    const { data: votesFetched } = await supabase
        .from("votes")
        .select("*, people (*)");
    people.value = peopleFetched as unknown as DBID[];
    votes.value = votesFetched as unknown as DBVote[];
    loading.value = false;
};

const allGrades = ref<string[]>([]);

onMounted(async () => {
    const { data } = await supabase
        .from("config")
        .select()
        .eq("key", "votableGrades")
        .single();
    allGrades.value = (data as unknown as { value: string }).value.split(",");
});

onMounted(refreshList);

const listener = supabase
    .channel("custom-all-channel")
    .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "people" },
        () => refreshList()
    )
    .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes" },
        (payload: RealtimePostgresChangesPayload<{ [key: string]: any }>) => {
            if (payload.eventType === "INSERT") {
                let newVote = payload.new;
                let person;
                for (let index = 0; index < people.value.length; index++) {
                    person = people.value[index];
                    if (person.id === newVote.voter_id) {
                        newVote.people = person;
                        people.value.splice(index, 1);
                        break;
                    }
                }
                votes.value.push(newVote as DBVote);
            } else {
                refreshList();
            }
        }
    )
    .subscribe();

const columns = computed(() => {
    return votedMode.value
        ? [
              {
                  key: "people.id",
                  label: "ID",
                  sortable: true,
              },
              {
                  key: "people.first_name",
                  label: "Имя",
                  sortable: true,
              },
              {
                  key: "people.last_name",
                  label: "Фамилия",
                  sortable: true,
              },
              {
                  key: "people.grade",
                  label: "Класс",
                  sortable: true,
              },
              {
                  key: "ip",
                  label: "Информация",
                  sortable: true,
              },
              {
                  key: "info",
              },
          ]
        : [
              {
                  key: "id",
                  label: "ID",
                  sortable: true,
              },
              {
                  key: "first_name",
                  label: "Имя",
                  sortable: true,
              },
              {
                  key: "last_name",
                  label: "Фамилия",
                  sortable: true,
              },
              {
                  key: "grade",
                  label: "Класс",
                  sortable: true,
              },
              {
                  key: "actions",
              },
          ];
});

const filteredNotVoted = computed(() => {
    const operational = people.value.filter((person) => person.votes === null);
    if (!query.value) return operational;
    return operational.filter((person) => {
        return Object.values(person).some((value) => {
            return String(value)
                .toLowerCase()
                .includes(query.value.toLowerCase());
        });
    });
});

const filteredVoted = computed(() => {
    const operational = votes.value;
    if (!query.value) return operational;
    return operational.filter((_person) => {
        const person = (_person as DBVote).people;
        return Object.values(person).some((value) => {
            return String(value)
                .toLowerCase()
                .includes(query.value.toLowerCase());
        });
    });
});

const workingRows = reactive<{
	[key: number]: boolean
}>({})

const rowSelections = reactive<{
	[key: string]: boolean
}>({})

const submitVote = async (id: number) => {
	let voteArray = []
	const keys = Object.keys(rowSelections)
	for (let i = 0; i < keys.length; i++) {
		if (!rowSelections[keys[i]]) continue
		const key = keys[i]
		const prefix = `${id}_`
		if (key.startsWith(prefix)) {
			const grade = key.split(prefix)[1]
			voteArray.push(grade)
		}
	}
	if (voteArray.length !== 3) return
	const { error } = await supabase.from("votes").insert({
		ip: "ADMIN",
		vote: voteArray,
		voter_id: id
	} as any)
	if (!error) workingRows[id] = false
}

const VoteInfo = reactive({
    open: false,
    data: "",
});

const DeletionInfo = reactive<{
    open: boolean;
    id?: number;
    entered?: string;
}>({
    open: false,
    id: undefined,
    entered: undefined,
});

const attemptDeleteVote = (id: number) => {
    DeletionInfo.open = true;
    DeletionInfo.id = id;
    DeletionInfo.entered = undefined;
};

const confirmDeletion = async () => {
    if (
        !DeletionInfo.id ||
        DeletionInfo.entered !== `удалить ${DeletionInfo.id}`
    )
        return;
    const { error } = await supabase
        .from("votes")
        .delete()
        .eq("id", DeletionInfo.id);
    if (!error) DeletionInfo.open = false;
};
</script>

<template>
    <div class="__admin-main">
        <ClientOnly>
            <UModal v-model="DeletionInfo.open">
                <div class="p-6 flex flex-col gap-2">
                    <h2 class="text-xl">
                        Введите 'удалить {{ DeletionInfo.id }}'
                    </h2>
                    <UInput v-model="DeletionInfo.entered" />
                    <UButton
                        @click="confirmDeletion"
                        :disabled="
                            DeletionInfo.entered !==
                            `удалить ${DeletionInfo.id}`
                        "
                        color="red"
                        variant="soft"
                        label="Подтвердить удаление"
                    />
                </div>
            </UModal>
            <USlideover v-model="VoteInfo.open">
                <div class="p-4 flex flex-col gap-4">
                    <h1>Информация о голосе</h1>
                    <hr />
                    <pre
                        style="white-space: pre-wrap"
                        v-html="VoteInfo.data"
                    ></pre>
                </div>
            </USlideover>
            <div
                class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700 gap-4 items-center"
            >
                <UInput v-model="query" placeholder="Поиск..." />
                <div
                    style="
                        height: 2.5rem;
                        border-left: 1px solid rgba(255, 255, 255, 0.2);
                    "
                />
                <span>Не проголосовали</span>
                <UToggle v-model="votedMode" />
                <span>Проголосовали</span>
            </div>
            <UTable
                :loading="loading"
                :rows="votedMode ? filteredVoted : filteredNotVoted"
                :columns="columns"
            >
                <template #ip-data="{ row }">
                    <UButton
                        color="white"
                        label="Смотреть"
                        @click="
                            () => {
                                VoteInfo.open = true;
                                VoteInfo.data = row.ip;
                            }
                        "
                    />
                </template>
                <template #actions-data="{ row }">
                    <div class="actions-list flex gap-4" v-if="workingRows[row.id]">
                        <template v-for="grade in allGrades">
                            <div class="flex gap-2 flex-col items-center">
                                <UBadge variant="subtle" :label="grade" />
                                <UCheckbox v-model="rowSelections[`${row.id}_${grade}`]"/>
                            </div>
                        </template>
						<UButton @click="submitVote(row.id)" variant="link" icon="i-heroicons-check"/>
                    </div>
					<UButton v-else @click="workingRows[row.id] = true" variant="soft" icon="i-heroicons-plus-circle-16-solid"/>
                </template>
                <template #info-data="{ row }">
                    <div class="actions-list flex items-center gap-4">
                        <UBadge v-for="grade in row.vote" variant="subtle">{{
                            grade
                        }}</UBadge>
                        <UButton
                            @click="attemptDeleteVote(row.id)"
                            color="red"
                            variant="soft"
                            label="Удалить голос"
                        />
                    </div>
                </template>
            </UTable>
        </ClientOnly>
    </div>
</template>

<style lang="scss" scoped>
.__admin-main {
    padding: 1rem;
}
</style>
