<template>
  <div>
    <ul v-if="data">
      <li v-for="task in data" :key="task.id">
        <button
          type="button"
          :disabled="disabled === task.id"
          @click="deleteTask(task)"
        >
          ❌
        </button>

        <label>
          <input
            type="checkbox"
            :checked="task.completed"
            :disabled="disabled === task.id"
            @change="completeTask(task)"
          >
          {{ task.title }}
        </label>
      </li>
    </ul>

    <form @submit.prevent="createTask">
      <fieldset>
        <legend>Create a new task</legend>
        <input v-model="title" type="text" placeholder="Task title" >
        <button type="submit" :disabled="!title">Create</button>
      </fieldset>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { Database, Tables } from "@/types/supabase";

type Task = Tables<"tasks">;

const client = useSupabaseClient<Database>();

const { data, refresh } = useAsyncData(async () => {
  const { data: tasks } = await client
    .from("tasks")
    .select("*")
    .order("created_at");
  return tasks;
});

const title = ref("");

async function createTask() {
  if (!title.value) return;

  const { error } = await client
    .from("tasks")
    .insert({ title: title.value, completed: false });

  if (error) {
    alert(error.message);
  } else {
    title.value = "";
    refresh();
  }
}

const disabled = ref<number>();

async function completeTask(task: Task) {
  disabled.value = task.id;

  const { error } = await client
    .from("tasks")
    .update({ completed: !task.completed })
    .eq("id", task.id);

  if (error) {
    alert(error.message);
  } else {
    await refresh();
  }

  disabled.value = undefined;
}

async function deleteTask(task: Task) {
  disabled.value = task.id;

  const { error } = await client.from("tasks").delete().eq("id", task.id);

  if (error) {
    alert(error.message);
  } else {
    await refresh();
  }

  disabled.value = undefined;
}
</script>
