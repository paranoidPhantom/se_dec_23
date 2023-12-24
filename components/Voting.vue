<script lang="ts" setup>
interface Identity {
    first_name?: string;
    last_name?: string;
    grade?: string;
}

interface IdentityList {
    first_name: string[];
    last_name: string[];
    grade: string[];
}

interface DBID extends Identity {
    id: number;
}

const People = ref<DBID[]>([]);
const Form = reactive<Identity>({
    first_name: undefined,
    last_name: undefined,
    grade: undefined,
});

const FormOptions = reactive<IdentityList>({
    first_name: [],
    last_name: [],
    grade: [],
});

const allGrades = ref<string[]>([]);

const done = ref(false);
const pending = ref(false);
const pendingFilters = ref(false);
const autofillAttempt = ref(false);
const voteCount = 3;
const errorMSG = ref();

const supabase = useSupabaseClient();

const search = async (initial?: boolean) => {
    pendingFilters.value = true;
    FormOptions.first_name = [];
    FormOptions.last_name = [];
    FormOptions.grade = [];
    let query = supabase.from("people").select();
    if (Form.first_name) {
        query = query.eq("first_name", Form.first_name);
    }
    if (Form.last_name) {
        query = query.eq("last_name", Form.last_name);
    }
    if (Form.grade) {
        query = query.eq("grade", Form.grade);
    }
    const { data } = (await query) as {
        data: DBID[];
    };
    People.value = data;
    const f_names: Set<string> = new Set();
    const l_names: Set<string> = new Set();
    const grades: Set<string> = new Set();
    data?.forEach((identity: any) => {
        f_names.add(identity.first_name);
        l_names.add(identity.last_name);
        grades.add(identity.grade);
    });
    if (initial) allGrades.value = Array.from(grades);
    FormOptions.first_name = Array.from(f_names);
    FormOptions.last_name = Array.from(l_names);
    FormOptions.grade = Array.from(grades);
    pendingFilters.value = false;
    if (autofillAttempt.value === false) {
        if (FormOptions.first_name.length === 1) {
            Form.first_name = FormOptions.first_name[0];
        }
        if (FormOptions.last_name.length === 1) {
            Form.last_name = FormOptions.last_name[0];
        }
        if (FormOptions.grade.length === 1) {
            Form.grade = FormOptions.grade[0];
        }
    }
};

onMounted(() => search(true));

watch(Form, () => search(false));
watch(Form, () => {
    if (Form.grade) checked[Form.grade] = false;
    errorMSG.value = undefined;
});

const clearField = (event: Event, field: keyof typeof Form) => {
    if (!Form[field]) return;
    autofillAttempt.value = true;
    event.stopPropagation();
    Form[field] = undefined;
    setTimeout(() => {
        autofillAttempt.value = false;
    }, 3000);
};

const fields: {
    key: keyof Identity;
    label: string;
    hint?: string;
    placeholder: string;
}[] = [
    {
        key: "first_name",
        label: "Имя",
        placeholder: "Иван",
    },
    {
        key: "last_name",
        label: "Фамилия",
        placeholder: "Иванов",
    },
    {
        key: "grade",
        label: "Класс",
        placeholder: "10А",
    },
];

const checked: {
    [key: string]: boolean;
} = reactive({});

const checked_count = computed(() => {
    let count = 0;
    allGrades.value.forEach((grade) => {
        if (checked[grade]) count++;
    });
    return count;
});

const formLink = () => {
    let list: string[] = [];
    allGrades.value.forEach((grade) => {
        if (checked[grade]) list.push(grade);
    });
    return `https://docs.google.com/forms/d/13SL0EVRdQ-si5uokbbQeeyi9gu64vwdIecoI3kyWE4M/formResponse?Submit=submit&entry.542018284=${Form.first_name}&entry.580522598=${Form.last_name}&entry.1302154356=${Form.grade}&entry.1469529244=${list[0]}&entry.1469529244=${list[1]}&entry.1469529244=${list[2]}`;
};

const finish_vote = async () => {
    if (done.value === true) return;
    let vote: string[] = [];
    allGrades.value.forEach((grade) => {
        if (checked[grade]) vote.push(grade);
    });
    if (vote.length !== voteCount) return;
    let UID: number | undefined;
    People.value.forEach((Person) => {
        if (
            (Person.first_name === Form.first_name,
            Person.last_name === Form.last_name,
            Person.grade === Form.grade)
        )
            UID = Person.id;
    });
    if (!UID) return;
    const { error, status } = await useFetch("/api/submit_vote", {
        method: "post",
        body: {
            UID: UID,
            vote: vote,
            link: formLink(),
        },
    });
    if (status.value === "success") {
        done.value = true;
    } else if (status.value === "error" && error.value?.statusCode === 400) {
        switch (error.value?.statusMessage) {
            case "23505": {
                errorMSG.value = "Вы уже проголосовали...";
                break;
            }
            case "IP": {
                errorMSG.value =
                    "С вашего IP уже поступал голос (вы достигли лимита)";
                break;
            }
        }
    }
};

const listener = supabase
    .channel("custom-all-channel")
    .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "people" },
        () => search()
    )
    .subscribe();
</script>

<template>
    <div class="__form">
        <h1>Голосование за лучшие номера</h1>
        <hr />
        <template v-if="!done">
            <UFormGroup
                v-for="field in fields"
                :label="field.label"
                :hint="field.hint"
            >
                <USelectMenu
                    selected-icon=""
                    v-model="Form[field.key]"
                    searchable
                    :options="FormOptions[field.key]"
                    by="field.key"
                    :disabled="!!Form[field.key]"
                >
                    <template #option-empty="{ query }">
                        <q>{{ query }}</q> не найден
                    </template>
                    <template #label>
                        <span v-if="Form[field.key]">{{
                            Form[field.key]
                        }}</span>
                        <span v-else-if="!pendingFilters" class="opacity-20">{{
                            field.placeholder
                        }}</span>
                        <Icon
                            v-else
                            class="opacity-30"
                            name="svg-spinners:ring-resize"
                        />
                        <UButton
                            :class="{ 'opacity-0': !Form[field.key] }"
                            @click="
                                (event) => {
                                    clearField(event, field.key);
                                }
                            "
                            class="ml-auto"
                            icon="i-heroicons-x-mark-solid"
                            variant="link"
                        />
                    </template>
                </USelectMenu>
            </UFormGroup>
            <UFormGroup
                label="Выбор"
                help="Выберите 3 наиболее понравившиеся выступления"
            >
                <div class="flex flex-col gap-2">
                    <UCheckbox
                        :disabled="
                            (!checked[grade] && checked_count >= voteCount) ||
                            grade === Form.grade
                        "
                        v-for="grade in allGrades"
                        :label="grade"
                        v-model="checked[grade]"
                    />
                </div>
            </UFormGroup>
            <hr />
            {{ errorMSG }}
            <div class="error-wrapper">
                <Transition name="error">
                    <div
                        class="error text-red-500"
                        v-if="!!errorMSG"
                        :key="errorMSG"
                    >
                        <Icon class="text-2xl" name="line-md:account-alert" />
                        <p class="p-0">{{ errorMSG }}</p>
                    </div>
                </Transition>
            </div>
            <UButton
                @click="finish_vote"
                label="Проголосовать"
                size="xl"
                variant="soft"
                :disabled="
                    checked_count !== voteCount ||
                    !Form.first_name ||
                    !Form.last_name ||
                    !Form.grade ||
                    pending
                "
                :loading="pending"
            />
        </template>
        <div class="flex flex-col items-center gap-4 py-12" v-else>
            <Icon class="text-3xl" name="line-md:confirm-circle-twotone" />
            <h2>Голос учтён</h2>
            <UButton label="Результаты" variant="soft" to="/results" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.__form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 50rem;
    padding: 2rem;
    border-radius: 1rem;
    background-color: rgb(var(--color-gray-900) / 0.8);
    border: 1px dashed rgb(var(--color-primary-DEFAULT));
    backdrop-filter: blur(2rem);
    h1 {
        font-size: 2rem;
    }
    h2 {
        font-size: 1.5rem;
    }
    > h1,
    > h2,
    > button {
        font-family: "Frozen", Arial;
        margin: 0 auto;
        text-align: center;
    }
}

.error {
    display: flex;
    align-items: center;
    gap: 1rem;
    height: 1.5rem;
    transition: all 0.5s;
    overflow: hidden;
    &.error-enter-from,
    &.error-leave-to {
        height: 0;
        opacity: 0;
        translate: 0 1rem;
    }
}
</style>
