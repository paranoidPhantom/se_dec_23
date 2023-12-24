<script lang="ts" setup>
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "vue-chartjs";

definePageMeta({
    name: "Результаты голосования",
});

const supabase = useSupabaseClient();

interface DBVote {
    id: number;
    voter_id: number;
    vote: string[];
}

interface TableVote {
    grade: string;
    votes: number;
}

const columns = [
    {
        key: "grade",
        label: "Класс",
    },
    {
        key: "votes",
        label: "Голосов",
    },
];

const { data: initialVotes } = (await supabase.from("votes").select()) as {
    data: DBVote[];
};

const votes = ref<DBVote[]>(initialVotes);

const handle_postgres_changes = (
    payload: RealtimePostgresChangesPayload<{ [key: string]: any }>
) => {
    const vote =
        payload.eventType !== "DELETE"
            ? (payload.new as DBVote)
            : (payload.old as DBVote);
    switch (payload.eventType) {
        case "INSERT":
            votes.value.push(vote);
            break;
        case "UPDATE":
            votes.value.forEach((vote_checking: DBVote, index: number) => {
                if (vote_checking.id === vote.id) {
                    Object.assign(votes.value[index], vote);
                }
            });
            break;
        case "DELETE":
            votes.value.forEach((vote_checking: DBVote, index: number) => {
                if (vote_checking.id === vote.id) {
                    votes.value.splice(index, 1);
                }
            });
            break;
    }
};

const listener = supabase
    .channel("custom-all-channel")
    .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes" },
        handle_postgres_changes
    )
    .subscribe();

const data = computed(() => {
    let resultObject: {
        [key: string]: number;
    } = {};
    votes.value.forEach((vote) => {
        for (let i = 0; i < vote.vote.length; i++) {
            if (!resultObject[vote.vote[i]]) resultObject[vote.vote[i]] = 0;
            resultObject[vote.vote[i]]++;
        }
    });
    let retval: TableVote[] = [];
    const keys = Object.keys(resultObject);
    keys.forEach((key: string) => {
        retval.push({
            grade: key,
            votes: resultObject[key],
        });
    });
    return retval;
});

// Pie chart

let colors: {
	[key: string]: string;
} = {}

const pie_data = computed(() => {
    let retval = {
        labels: [],
        datasets: [
            {
                backgroundColor: [],
                data: [],
            },
        ],
    };
	data.value.forEach((entry, index) => {
		if (!colors[entry.grade]) colors[entry.grade] = Math.floor(Math.random()*16777215).toString(16);
		retval.labels[index] = entry.grade
		retval.datasets[0].backgroundColor[index] = "#"+colors[entry.grade]
		retval.datasets[0].data[index] = entry.votes
	})
	return retval
});

ChartJS.register(ArcElement, Tooltip, Legend);
//
</script>

<template>
    <div class="__results px-6 sm:px-12 md:px-20 lg:px-32 pt-12 gap-8">
		<h1>Результаты голосования</h1>
		<div class="data flex gap-8 justify-center flex-wrap">
			<div class="pie-wrapper">
				<Pie style="position: relative;" :data="pie_data" :options="{ responsive: true }" />
			</div>
			<div class="table-wrapper">
				<UTable :columns="columns" :rows="data"/>
			</div>
		</div>
    </div>
</template>

<style lang="scss" scoped>
.__results {
    display: flex;
    flex-direction: column;
    align-items: center;
	background-position: center;
	background-size: cover;
	.data {
		width: 100%;
		.pie-wrapper {
			display: flex;
			justify-content: center;
			width: 100%;
			max-width: 40rem;
			background-color: rgba(0, 0, 0, 0.8);
			padding: 2rem;
			backdrop-filter: blur(1rem);
			aspect-ratio: 1;
			border-radius: 100rem;
			padding-bottom: 4rem;
			> * {
				filter: invert(1) contrast(1.2);
			}
		}
		.table-wrapper {
			background-color: rgba(0, 0, 0, 0.8);
			backdrop-filter: blur(1rem);
			padding: 1rem;
			border-radius: 2rem;
		}
	}
    h1 {
        font-size: 3rem;
        font-family: "Frozen", Arial;
        margin: 0 auto;
        text-align: center;
		filter: drop-shadow(0 0 1rem black);
    }
}
</style>
