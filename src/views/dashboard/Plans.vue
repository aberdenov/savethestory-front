<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../../api/client';
import DashboardLayout from '../../layouts/DashboardLayout.vue';

const route = useRoute();

const catalog = ref({
    plans: [],
    extensions: [],
    payment_ready: false,
});

const memorials = ref([]);
const orders = ref([]);

const selectedMemorial = ref(
    route.query.memorialId ? String(route.query.memorialId) : '',
);

const loading = ref(true);
const busy = ref('');
const notice = ref('');
const error = ref('');

const money = (value) =>
    new Intl.NumberFormat('ru-RU').format(value) + ' ₸';

const selectedName = computed(() => {
    const memorial = memorials.value.find(
        (item) => String(item.id) === selectedMemorial.value,
    );

    return memorial?.full_name || '';
});

const load = async () => {
    try {
        const [
            plansResponse,
            memorialResponse,
            orderResponse,
        ] = await Promise.all([
            api.get('/plans'),
            api.get('/memorials'),
            api.get('/plan-orders'),
        ]);

        catalog.value = plansResponse.data;
        memorials.value =
            memorialResponse.data.data || memorialResponse.data;
        orders.value = orderResponse.data.data || orderResponse.data;

        if (!selectedMemorial.value && memorials.value.length) {
            selectedMemorial.value = String(memorials.value[0].id);
        }
    } catch (e) {
        error.value =
            e.response?.data?.message || 'Не удалось загрузить тарифы';
    } finally {
        loading.value = false;
    }
};

const order = async (type, value) => {
    if (!selectedMemorial.value) {
        error.value = 'Сначала создайте анкету.';
        return;
    }

    busy.value = `${type}-${value}`;
    error.value = '';
    notice.value = '';

    try {
        const payload =
            type === 'plan'
                ? {
                    type: 'plan',
                    package_code: value,
                }
                : {
                    type: 'extension',
                    extension_years: value,
                };

        const { data } = await api.post(
            `/memorials/${selectedMemorial.value}/plan-orders`,
            payload,
        );

        notice.value =
            `${data.payment.message} ` +
            `Номер заказа: ${data.order.id}. ` +
            `Анкета: ${selectedName.value}.`;

        orders.value.unshift({
            ...data.order,
            memorial: {
                full_name: selectedName.value,
            },
        });
    } catch (e) {
        error.value =
            e.response?.data?.message || 'Не удалось создать заказ';
    } finally {
        busy.value = '';
    }
};

onMounted(load);
</script>

<template>
    <DashboardLayout>
        <div class="flex flex-wrap items-end justify-between gap-4">
            <div>
                <router-link
                    to="/dashboard"
                    class="text-sm font-semibold text-slate-500"
                >
                    ← К анкетам
                </router-link>

                <h1 class="mt-2 text-3xl font-bold">
                    Тарифы и продление
                </h1>

                <p class="mt-2 max-w-2xl text-slate-500">
                    Выберите возможности страницы памяти и срок хранения.
                    Заказ можно оформить сейчас, онлайн-оплата подключается
                    отдельно.
                </p>
            </div>

            <label class="min-w-64">
                <span class="label">Анкета</span>

                <select
                    v-model="selectedMemorial"
                    class="input mt-1"
                >
                    <option value="">Выберите анкету</option>

                    <option
                        v-for="item in memorials"
                        :key="item.id"
                        :value="String(item.id)"
                    >
                        {{ item.full_name }}
                    </option>
                </select>
            </label>
        </div>

        <div v-if="loading" class="mt-8 text-slate-500">
            Загружаем тарифы…
        </div>

        <template v-else>
            <p
                v-if="error"
                class="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700"
            >
                {{ error }}
            </p>

            <p
                v-if="notice"
                class="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
            >
                {{ notice }}
            </p>

            <div class="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <article
                    v-for="plan in catalog.plans"
                    :key="plan.code"
                    class="card flex flex-col"
                    :class="
                        plan.code === 'history'
                            ? 'border-amber-300 ring-2 ring-amber-100'
                            : ''
                    "
                >
                    <div class="flex items-start justify-between gap-2">
                        <h2 class="text-xl font-bold">
                            {{ plan.name }}
                        </h2>

                        <span
                            v-if="plan.code === 'history'"
                            class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800"
                        >
                            Основной
                        </span>
                    </div>

                    <p class="mt-4 text-3xl font-bold">
                        {{ plan.price ? money(plan.price) : 'Бесплатно' }}
                    </p>

                    <p class="mt-2 min-h-16 text-sm leading-6 text-slate-600">
                        {{ plan.description }}
                    </p>

                    <ul
                        class="my-5 flex-1 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-700"
                    >
                        <li>
                            ✓ Хостинг {{ plan.hosting_years }}
                            {{ plan.hosting_years === 1 ? 'год' : 'лет' }}
                        </li>
                        <li>✓ QR-код и страница памяти</li>

                        <li v-if="plan.bio_limit">
                            ✓ Биография до {{ plan.bio_limit }} символов
                        </li>
                        <li v-else>✓ Полная биография</li>

                        <li v-if="plan.avatar">✓ Фото-аватар</li>

                        <li v-if="plan.media">
                            ✓ Галерея: фото, видео и аудио — до
                            {{ plan.gallery_storage_mb }} МБ
                        </li>

                        <li v-if="plan.guestbook">
                            ✓ Воспоминания гостей с мультимедиа — ещё {{ plan.guestbook_storage_mb }} МБ отдельно
                        </li>
                    </ul>

                    <button
                        class="btn-primary w-full"
                        :disabled="!plan.price || !!busy"
                        @click="order('plan', plan.code)"
                    >
                        {{
                            busy === `plan-${plan.code}`
                                ? 'Создаём заказ…'
                                : plan.price
                                    ? 'Выбрать тариф'
                                    : 'Текущий стартовый тариф'
                        }}
                    </button>

                    <p
                        v-if="plan.price"
                        class="mt-2 text-center text-xs text-slate-400"
                    >
                        К оплате: {{ money(plan.price) }}
                    </p>
                </article>
            </div>

            <section class="card mt-8">
                <div
                    class="flex flex-wrap items-start justify-between gap-4"
                >
                    <div>
                        <h2 class="text-2xl font-bold">
                            Продление хостинга
                        </h2>

                        <p class="mt-1 text-sm text-slate-500">
                            Продлите страницу памяти на выбранный срок.
                        </p>
                    </div>

                    <span
                        class="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold"
                    >
                        {{ selectedName || 'Выберите анкету выше' }}
                    </span>
                </div>

                <div class="mt-5 grid gap-3 md:grid-cols-3">
                    <button
                        v-for="extension in catalog.extensions"
                        :key="extension.years"
                        class="rounded-2xl border border-slate-200 p-5 text-left hover:border-slate-400"
                        :disabled="!!busy"
                        @click="order('extension', extension.years)"
                    >
                        <span class="block text-lg font-bold">
                            {{ extension.years }}
                            {{ extension.years === 1 ? 'год' : 'лет' }}
                        </span>

                        <span class="mt-1 block text-2xl font-bold">
                            {{ money(extension.price) }}
                        </span>

                        <span class="mt-3 block text-sm text-slate-500">
                            {{
                                busy === `extension-${extension.years}`
                                    ? 'Создаём заказ…'
                                    : 'Оформить продление →'
                            }}
                        </span>
                    </button>
                </div>
            </section>

            <section v-if="orders.length" class="card mt-8">
                <h2 class="text-2xl font-bold">Ваши заказы</h2>

                <div class="mt-4 divide-y divide-slate-100">
                    <div
                        v-for="item in orders"
                        :key="item.id"
                        class="flex flex-wrap items-center justify-between gap-3 py-4"
                    >
                        <div>
                            <p class="font-semibold">
                                Заказ №{{ item.id }} ·
                                {{ item.memorial?.full_name }}
                            </p>

                            <p class="text-sm text-slate-500">
                                {{
                                    item.package_code
                                        ? `Тариф ${item.package_code}`
                                        : `Продление на ${item.extension_years} лет`
                                }}
                                ·
                                {{
                                    new Date(item.created_at)
                                        .toLocaleDateString('ru-RU')
                                }}
                            </p>
                        </div>

                        <div class="text-right">
                            <p class="font-bold">
                                {{ money(item.amount) }}
                            </p>

                            <p class="text-xs text-amber-700">
                                {{
                                    item.status === 'paid'
                                        ? 'Оплачен'
                                        : item.status === 'pending'
                                            ? 'Ожидает оплаты'
                                            : item.status
                                }}
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </template>
    </DashboardLayout>
</template>