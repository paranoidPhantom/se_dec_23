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
        .select("vote, voter_id, ip, people (*)");
    people.value = peopleFetched as unknown as DBID[];
    votes.value = votesFetched as unknown as DBVote[];
    loading.value = false;
};

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
            refreshList();
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

const getLocalIP = (callback: Function) => {
    const RTCPeerConnection =
        window.RTCPeerConnection ||
        (window as any).mozRTCPeerConnection ||
        (window as any).webkitRTCPeerConnection;
    const pc = new RTCPeerConnection();

    pc.createDataChannel("");

    pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch((error) => console.error("Error creating offer:", error));

    pc.onicecandidate = (event) => {
        if (!event.candidate) {
            callback(
                (pc as any).localDescription.sdp.match(/(192\.168\.\S+)/g) || []
            );
        }
    };
};

onMounted(() => {
    // Example usage
    getLocalIP((localIPs: string[]) => {
        console.log("Local IP addresses:", localIPs);
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
</script>

<template>
    <div class="__admin-main">
        <ClientOnly>
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
                <template #actions-data="{ row }">
                    <div class="actions-list flex gap-4 shrink-0"></div>
                </template>
                <template #info-data="{ row }">
                    <div class="actions-list flex gap-4 shrink-0">
                        <UBadge v-for="grade in row.vote" variant="subtle">{{
                            grade
                        }}</UBadge>
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
