<script setup>
import { reactive, ref } from "vue";
import { api } from "../../api/client";
import AuthLayout from "../../layouts/AuthLayout.vue";

const message = ref("");
const error = ref("");
const form = reactive({ email: "" });

const submit = async () => {
    try {
        error.value = "";
        const { data } = await api.post("/forgot-password", form);
        message.value = data.message;
    } catch (e) {
        error.value = e.response?.data?.message || "Ошибка";
    }
};
</script>
<template>
    <AuthLayout>
        <h1 class="mt-6 text-3xl font-bold">Восстановление пароля</h1>
        
        <form class="mt-6 space-y-4" @submit.prevent="submit">
            <input class="input" v-model="form.email" placeholder="Email" />
            <p v-if="message" class="text-sm text-green-700">{{ message }}</p>
            <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
            <button class="btn-primary w-full">Отправить ссылку</button>
        </form>

        <router-link class="mt-5 block text-sm font-semibold" to="/login">Назад ко входу</router-link>
    </AuthLayout>
</template>
