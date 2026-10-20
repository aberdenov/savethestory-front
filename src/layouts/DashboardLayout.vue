<script setup>
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();

const logout = async () => {
    await auth.logout();
    location.href = '/login';
};
</script>

<template>
    <main class="min-h-screen bg-slate-100">
        <header class="border-b border-slate-200 bg-white">
            <div class="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
                <router-link to="/dashboard" class="text-lg font-bold">
                    Memorial Service
                </router-link>

                <nav class="flex items-center gap-3">
                    <router-link
                        to="/dashboard/plans"
                        class="text-sm font-semibold text-slate-600 hover:text-slate-950"
                    >
                        Тарифы
                    </router-link>

                    <button class="btn-secondary !py-2" @click="logout">
                        Выйти
                    </button>
                </nav>
            </div>
        </header>

        <section class="mx-auto max-w-7xl px-5 py-8">
            <slot />
        </section>
    </main>
</template>