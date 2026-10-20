<script setup>
import { onMounted, ref } from 'vue';
import { api } from '../../api/client';
import DashboardLayout from '../../layouts/DashboardLayout.vue';

const memorials = ref([]);
const loading = ref(true);

const load = async () => {
    loading.value = true;

    try {
        const { data } = await api.get('memorials');
        memorials.value = data.data || data;
    } finally {
        loading.value = false;
    }
};

const remove = async (id) => {
    if (!confirm('Удалить анкету?')) return;

    await api.delete(`/memorials/${id}`);
    await load();
};

const publish = async (item) => {
    await api.post(
        `memorials/${item.id}/${
            item.status === 'published' ? 'unpublish' : 'publish'
        }`,
    );

    await load();
};

const formatDate = (value) => {
    if (!value) return '';

    return new Date(value).toLocaleDateString('ru-RU');
};

onMounted(load);
</script>

<template>
    <DashboardLayout>
        <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 class="text-3xl font-bold">Анкеты</h1>
                <p class="text-slate-500">
                    Создавайте несколько страниц памяти внутри одного аккаунта.
                </p>
            </div>

            <router-link
                class="btn-primary"
                to="/dashboard/memorials/new"
            >
                Создать анкету
            </router-link>
        </div>

        <div v-if="loading" class="mt-8 text-slate-500">
            Загрузка...
        </div>

        <div
            v-else
            class="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
            <article
                v-for="item in memorials"
                :key="item.id"
                class="card"
            >
                <div
                    class="mb-4 aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100"
                >
                    <img
                        v-if="item.main_photo"
                        :src="item.main_photo"
                        class="h-full w-full object-cover"
                    />

                    <div
                        v-else
                        class="flex h-full items-center justify-center text-slate-400"
                    >
                        Нет фото
                    </div>
                </div>

                <div class="flex items-start justify-between gap-3">
                    <div>
                        <h2 class="text-xl font-bold">
                            {{ item.full_name }}
                        </h2>

                        <p class="text-sm text-slate-500">
                            /{{ item.slug }}
                        </p>

                        <p class="mt-1 text-xs font-semibold text-amber-700">
                            Тариф: {{ item.package_code || 'free' }}

                            <span v-if="item.hosting_expires_at">
                                · до {{ formatDate(item.hosting_expires_at) }}
                            </span>
                        </p>
                    </div>

                    <span
                        class="rounded-full px-3 py-1 text-xs font-bold"
                        :class="
                            item.status === 'published'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-slate-100 text-slate-600'
                        "
                    >
                        {{ item.status }}
                    </span>
                </div>

                <div class="mt-5 flex flex-wrap gap-2">
                    <router-link
                        class="btn-secondary !px-3 !py-2 text-sm"
                        :to="`/dashboard/memorials/${item.id}/edit`"
                    >
                        Редактировать
                    </router-link>

                    <router-link
                        class="btn-secondary !px-3 !py-2 text-sm"
                        :to="`/dashboard/plans?memorialId=${item.id}`"
                    >
                        Тариф / продление
                    </router-link>

                    <button
                        class="btn-secondary !px-3 !py-2 text-sm"
                        @click="publish(item)"
                    >
                        {{ item.status === 'published' ? 'Снять' : 'Опубликовать' }}
                    </button>

                    <a
                        v-if="item.status === 'published'"
                        class="btn-secondary !px-3 !py-2 text-sm"
                        :href="`/m/${item.slug}`"
                        target="_blank"
                    >
                        Открыть
                    </a>

                    <button
                        class="btn-secondary !px-3 !py-2 text-sm text-red-600"
                        @click="remove(item.id)"
                    >
                        Удалить
                    </button>
                </div>
            </article>
        </div>
    </DashboardLayout>
</template>