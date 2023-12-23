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

const People = ref<Identity[]>([]);
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

const allGrades = ref<string[]>([])

const supabase = useSupabaseClient();

const search = async (initial?: boolean) => {
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
        data: Identity[];
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
	if (initial) allGrades.value = grades
    FormOptions.first_name = Array.from(f_names);
    FormOptions.last_name = Array.from(l_names);
    FormOptions.grade = Array.from(grades);
};

onMounted(() => search(true));

watch(Form, () => search(false));

const clearField = (event: Event, field: keyof typeof Form) => {
    if (!Form[field]) return;
    event.stopPropagation();
    Form[field] = undefined;
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
        placeholder: "Иванов",
    },
    {
        key: "last_name",
        label: "Фамилия",
        placeholder: "Иван",
    },
    {
        key: "grade",
        label: "Класс",
        placeholder: "10А",
    },
];

const checked: {
	[key: string]: boolean;
} = reactive({})

const checked_count = computed(() => {
	let count = 0
	allGrades.value.forEach(grade => {
		if (checked[grade]) count++
	});
	return count
})
</script>

<template>
    <div class="__form">
        <h1>Голосование за лучшие номера</h1>
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
                <template #label>
                    <span v-if="Form[field.key]">{{ Form[field.key] }}</span>
                    <span v-else class="opacity-20">{{
                        field.placeholder
                    }}</span>
                    <UButton
                        :class="{ 'opacity-0': !Form[field.key] }"
                        @click="(event) => clearField(event, field.key)"
                        class="ml-auto"
                        icon="i-heroicons-x-mark-solid"
                        variant="link"
                    />
                </template>
            </USelectMenu>
        </UFormGroup>
        <UFormGroup label="Выбор" help="Выберите 3 любимых выступлений">
			<div class="flex flex-col gap-2">
				<UCheckbox :disabled="!checked[grade] && checked_count >= 3" v-for="grade in allGrades" :label="grade" v-model="checked[grade]" />
			</div>
        </UFormGroup>
		YVY
    </div>
</template>

<style lang="scss" scoped>
.__form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 80%;
    padding: 2rem;
    border-radius: 1rem;
    background-color: rgb(var(--color-gray-800) / 0.85);
    h1 {
        font-size: 2rem;
        font-weight: 900;
        margin: 0 auto;
        font-family: "Frozen";
    }
}
</style>