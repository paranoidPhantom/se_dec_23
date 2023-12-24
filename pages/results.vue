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
		const randomColor = Math.floor(Math.random()*16777215).toString(16);
		retval.labels[index] = entry.grade
		retval.datasets[0].backgroundColor[index] = "#"+randomColor
		retval.datasets[0].data[index] = entry.votes
	})
	return retval
});

ChartJS.register(ArcElement, Tooltip, Legend);
//
</script>

<template>
    <div class="__results px-6 sm:px-12 md:px-20 lg:px-32 pt-12">
		<div class="pie-wrapper">
        	<Pie :data="pie_data" :options="{ responsive: true }" />
		</div>
        <!-- <UTable :rows="data" :columns="columns" /> -->
    </div>
</template>

<style lang="scss" scoped>
.__results {
    display: flex;
    flex-direction: column;
    align-items: center;
	justify-content: center;
	height: 100vh;
	background-image: url("/background2.webp");
	background-position: center;
	background-size: cover;
	.pie-wrapper {
		width: 50%;
		max-width: 30rem;
	}
}
</style>
