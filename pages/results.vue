<script lang="ts" setup>
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

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

const route = useRoute()

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

let gradeSortArray = [
    "1",
    "2",
    "3",
    "4",
    "5А",
    "5Б",
    "6А",
    "6Б",
    "7А",
    "7Б",
    "8А",
    "8Б",
    "9А",
    "9Б",
    "10А",
    "10Б",
    "11А",
    "11Б",
];

const listener = supabase
    .channel("custom-all-channel")
    .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes" },
        handle_postgres_changes
    )
    .subscribe();

const voteCount = computed(() => {
    let result = 0;
    votes.value.forEach((vote) => {
        for (let i = 0; i < vote.vote.length; i++) {
            result++;
        }
    });
    return result;
});

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
    return retval.sort((a, b) => {
        const aIndex = gradeSortArray.findIndex((val) => val === a.grade);
        const bIndex = gradeSortArray.findIndex((val) => val === b.grade);
        return aIndex - bIndex;
    });
});

const fullscreen = ref(route.query.fullscreen === "1")

defineShortcuts({
	shift_f: () => fullscreen.value = !fullscreen.value
})
</script>

<template>
    <div class="__results px-6 sm:px-12 md:px-20 lg:px-32 pt-12 gap-8">
        <h1>Результаты голосования</h1>
		<div class="clarification">
			<p>(Не финальные)</p>
		</div>
        <div class="data flex justify-center gap-8 items-center flex-wrap">
            <div class="chart flex gap-1 sm:gap-2 md:gap-4 w-full" :class="{ fullscreen: fullscreen }">
                <div class="graph flex flex-col justify-end items-center h-96">
                    <p class="h-full">100%</p>
                    <p class="h-full">80%</p>
                    <p class="h-full">60%</p>
                    <p class="h-full">40%</p>
                    <p class="h-full">20%</p>
                    <p class="opacity-80">
                        <i>Scale</i>
                    </p>
                </div>
                <div
                    class="bar flex flex-col  justify-end items-center h-96 w-full"
                    v-for="bar in data"
                >
                    <div
                        class="val flex items-center justify-center bg-primary-400 w-2 sm:w-4 lg:w-8 shadow-primary-400"
                        :style="{ height: `${(bar.votes / voteCount) * 100}%` }"
                    ></div>
                    <p class="opacity-80">
                        <i>{{ bar.grade }}</i>
                    </p>
                </div>
            </div>
            <div class="table-wrapper">
                <UTable :columns="columns" :rows="data" />
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
        .chart {
            .graph {
                p:after {
                    content: "";
                    position: absolute;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    right: 0;
                    left: 1rem;
                }
            }
            .val {
                transition: all 0.3s ease-in-out;
                box-shadow: 0 0 1rem var(--tw-shadow-color);
                border-radius: 3px 3px 0 0;
				cursor: pointer;
				.info {
					transition: all 0.3s ease-in-out;
					opacity: 0;
				}
				&:hover .info {
					opacity: 1;
				}
            }
			&.fullscreen {
				border-radius: 0;
				background-color: rgb(15,15,15);
				position: fixed;
				inset: 0;
				z-index: 2;
				align-items: center;
				.graph, .bar {
					height: 100%;
				}
			}
        }
        .chart,
        .table-wrapper {
            background-color: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(1rem);
            padding: 1rem;
            border-radius: 1rem;
        }
    }
    h1 {
        font-size: 3rem;
        font-family: "Frozen", Arial;
        margin: 0 auto;
        text-align: center;
        filter: drop-shadow(0 0 1rem black);
    }
	.clarification {
		backdrop-filter: blur(0.5rem);
		background-color: rgba(0,0,0,0.2);
		padding: 0.5rem;
		border-radius: 0.5rem;
	}
}
</style>
