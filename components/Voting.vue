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
	id: number
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
};

onMounted(() => search(true));

watch(Form, () => search(false));
watch(Form, () => {
	checked[Form.grade] = false
});

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
} = reactive({})

const checked_count = computed(() => {
	let count = 0
	allGrades.value.forEach(grade => {
		if (checked[grade]) count++
	});
	return count
})

const done = ref(false)
const pending = ref(false)
const voteCount = 1
const error = ref()

const finish_vote = async () => {
	if (done.value === true) return
	let vote: string[] = []
	allGrades.value.forEach(grade => {
		if (checked[grade]) vote.push(grade)
	});
	if (vote.length !== voteCount) return
	let UID: number | undefined
	People.value.forEach((Person) => {
		if (Person.first_name === Form.first_name, Person.last_name === Form.last_name, Person.grade === Form.grade) UID = Person.id
	})
	if (!UID) return
	const { error, status } = await useFetch("/api/submit_vote", {
		method: "post",
		body: {
			UID: UID,
			vote: vote
		}
	})
	watchEffect((stop) => {
		if (status.value === "success") {
			done.value = true
			stop(() => {})
		} else {

		}
	})
}
</script>

<template>
    <div class="__form">
        <h1>Голосование за лучшие номера</h1>
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
					<UCheckbox :disabled="!checked[grade] && checked_count >= voteCount || grade === Form.grade" v-for="grade in allGrades" :label="grade" v-model="checked[grade]" />
				</div>
			</UFormGroup>
			<UButton @click="finish_vote" label="Проголосовать" size="xl" variant="soft" :disabled="checked_count !== voteCount || !Form.first_name || !Form.last_name || !Form.grade || pending" :loading="pending"/>
		</template>
		<div class="flex flex-col items-center gap-4 py-12" v-else>
			<Icon class="text-3xl" name="line-md:confirm-circle-twotone"/>
			<h2>Голос учтён</h2>
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
    background-color: rgb(var(--color-gray-900) / 0.85);
    h1 {
        font-size: 2rem;
        font-weight: 900;
        margin: 0 auto;
		text-align: center;
    }
	> h1, h2 {
        font-family: "Frozen";
	}
}
</style>