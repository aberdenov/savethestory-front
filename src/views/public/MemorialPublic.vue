<script setup>
import { computed, ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../../api/client';

const route = useRoute();

const memorial = ref(null);
const galleryItems = computed(() => [
    ...(memorial.value?.photos || []).map((photo, index) => ({
        ...photo,
        key: `photo-${photo.id ?? index}`,
        type: 'image',
        url: photo.image,
    })),
    ...(memorial.value?.assets || []).map((asset) => ({
        ...asset,
        key: `asset-${asset.id}`,
    })),
]);
const loading = ref(true);
const error = ref('');

const quoteForm = reactive({
    author_name: '',
    author_relation: '',
    text: '',
});

const quoteSuccess = ref(false);
const quoteMedia = ref(null);

const quoteSending = ref(false);
const quoteError = ref('');
const quoteMediaInput = ref(null);
const quoteMediaPreview = ref('');

const clearQuoteMedia = () => {
    if (quoteMediaPreview.value) URL.revokeObjectURL(quoteMediaPreview.value);
    quoteMediaPreview.value = '';
    quoteMedia.value = null;
    if (quoteMediaInput.value) quoteMediaInput.value.value = '';
};

const selectQuoteMedia = (event) => {
    const file = event.target.files?.[0];
    clearQuoteMedia();
    quoteSuccess.value = false;
    quoteError.value = '';
    if (!file) return;
    quoteMedia.value = file;
    quoteMediaPreview.value = URL.createObjectURL(file);
};

onBeforeUnmount(clearQuoteMedia);

const sendQuote = async () => {
    if (quoteSending.value) return;
    quoteSending.value = true;
    quoteSuccess.value = false;
    quoteError.value = '';
    try {
        const body = new FormData();
        Object.entries(quoteForm).forEach(([key, value]) => body.append(key, value));
        if (quoteMedia.value) body.append('media', quoteMedia.value);
        await api.post(`/public/memorials/${memorial.value.id}/quotes`, body);
        quoteForm.author_name = '';
        quoteForm.author_relation = '';
        quoteForm.text = '';
        clearQuoteMedia();
        quoteSuccess.value = true;
    } catch (e) {
        quoteError.value = Object.values(e.response?.data?.errors || {}).flat().join(' ')
            || e.response?.data?.message || 'Не удалось отправить воспоминание. Попробуйте ещё раз.';
    } finally {
        quoteSending.value = false;
    }
};

const formatDate = (value) => {
    if (!value) return '';

    return new Date(value).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

onMounted(async () => {
    try {
        const { data } = await api.get(
            `/public/memorials/${route.params.slug}`,
        );
        memorial.value = data;
    } catch (e) {
        error.value = 'Страница не найдена или не опубликована';
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <main
        class="min-h-screen bg-[radial-gradient(circle_at_20%_10%,rgba(214,178,123,0.22),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(120,91,60,0.18),transparent_32%),linear-gradient(135deg,#0f1115_0%,#17130f_45%,#090a0d_100%)] text-white"
    >
        <div
            v-if="loading"
            class="p-10 text-center text-white/60"
        >
            Загрузка...
        </div>

        <div
            v-else-if="error"
            class="p-10 text-center text-white/60"
        >
            {{ error }}
        </div>

        <template v-else>
            <section class="relative overflow-hidden py-12 md:py-20">
                <div
                    class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(214,178,123,0.18),transparent_30%)]"
                ></div>

                <div
                    class="relative mx-auto grid max-w-7xl items-center gap-10 px-5 lg:grid-cols-[1.05fr_.95fr]"
                >
                    <div>
                        <div
                            class="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70"
                        >
                            Светлая память • История жизни
                        </div>

                        <h1
                            class="font-serif text-3xl font-bold leading-none tracking-tight md:text-7xl"
                        >
                            {{ memorial.full_name }}
                        </h1>

                        <p class="mt-5 text-xl text-[#d7dce6]">
                            {{ formatDate(memorial.birth_date) }} —
                            {{ formatDate(memorial.death_date) }}
                        </p>

                        <p
                            class="mt-5 max-w-2xl text-lg text-[#d7dce6] md:text-xl"
                        >
                            {{ memorial.short_description }}
                        </p>

                        <div class="mt-8 flex flex-wrap gap-4">
                            <a
                                href="#story"
                                class="rounded-full bg-[#d6b27b] px-6 py-3 font-semibold text-[#15120d]"
                            >
                                История жизни
                            </a>

                            <a
                                v-if="memorial.package_code === 'legacy'"
                                href="#memories"
                                class="rounded-full border border-white/10 bg-white/5 px-6 py-3 font-semibold"
                            >
                                Воспоминания друзей
                            </a>
                        </div>

                        <div class="mt-8 grid gap-4 md:grid-cols-3">
                            <div
                                v-for="fact in memorial.facts"
                                :key="fact.title"
                                class="rounded-2xl border border-white/10 bg-white/5 p-4"
                            >
                                <strong>{{ fact.title }}</strong>
                                <p class="mt-1 text-sm text-white/55">
                                    {{ fact.text }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        class="relative min-h-[700px] overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl"
                    >
                        <img
                            v-if="memorial.main_photo"
                            :src="memorial.main_photo"
                            class="absolute inset-0 h-full w-full object-cover"
                        />

                        <div
                            class="absolute inset-x-5 bottom-5 rounded-3xl border border-white/10 bg-black/45 p-5 backdrop-blur"
                        >
                            <p>
                                «Такие люди не уходят — они остаются внутри»
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section
                id="story"
                class="mx-auto max-w-7xl px-5 py-20"
            >
                <div class="mb-8">
                    <p
                        class="text-sm font-bold uppercase tracking-[.18em] text-[#d6b27b]"
                    >
                        История
                    </p>

                    <h2 class="mt-3 font-serif text-3xl font-bold md:text-5xl">
                        Жизнь, в которой было много движения, тепла и людей
                    </h2>
                </div>

                <div class="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
                    <article
                        class="rounded-3xl border border-white/10 bg-white/[.04] p-7 text-[#d7dce6]"
                    >
                        <p class="whitespace-pre-line">
                            {{ memorial.biography }}
                        </p>
                    </article>

                    <aside
                        class="rounded-3xl border border-white/10 bg-white/[.04] p-7"
                    >
                        <div
                            v-for="item in memorial.timelines"
                            :key="item.id"
                            class="border-b border-white/10 py-4 last:border-0"
                        >
                            <p
                                class="text-sm font-bold uppercase text-[#d6b27b]"
                            >
                                {{ item.period }}
                            </p>
                            <p class="mt-2 text-[#d7dce6]">
                                {{ item.description }}
                            </p>
                        </div>
                    </aside>
                </div>
            </section>

            <section
                class="mx-auto max-w-7xl px-5 py-20"
            >
                <div class="mb-8">
                    <p
                        class="text-sm font-bold uppercase tracking-[.18em] text-[#d6b27b]"
                    >
                        Путь
                    </p>

                    <h2 class="mt-3 font-serif text-3xl font-bold md:text-5xl">
                        Ключевые этапы его истории
                    </h2>
                </div>

                <div
                    class="rounded-[28px] border border-white/10 bg-white/[.04] p-7 md:p-8"
                >
                    <div
                        v-for="item in (memorial.life_sections || memorial.lifeSections || [])"
                        :key="item.id || item.title"
                        class="grid gap-4 border-b border-white/10 py-6 md:grid-cols-[250px_1fr]"
                    >
                        <div class="font-bold uppercase text-[#d6b27b]">
                            {{ item.title }}
                        </div>

                        <div class="font-semibold leading-relaxed text-white/75">
                            {{ item.text }}
                        </div>
                    </div>

                    <div
                        v-if="memorial.qualities?.length"
                        class="grid gap-3 pt-6 md:grid-cols-3"
                    >
                        <div
                            v-for="quality in memorial.qualities"
                            :key="quality"
                            class="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[.10] to-white/[.04] px-6 py-5 text-center font-bold text-white shadow-inner"
                        >
                            {{ quality }}
                        </div>
                    </div>
                </div>
            </section>

            <section class="mx-auto max-w-7xl px-5 py-20">
                <div class="mb-8">
                    <p
                        class="text-sm font-bold uppercase tracking-[.18em] text-[#d6b27b]"
                    >
                        Галерея
                    </p>

                    <h2 class="mt-3 text-3xl font-serif md:text-5xl">
                        Моменты, в которых чувствуется его характер
                    </h2>

                    <p class="max-w-[760px] text-[18px] text-[#B4BAC7]">
                        Дружба, семья, праздники, искренний смех, лёгкость и
                        любовь к жизни.
                    </p>
                </div>

                <div class="grid grid-cols-12 gap-5">
                    <figure
                        v-for="(item, index) in galleryItems"
                        :key="item.key"
                        class="group relative col-span-12 overflow-hidden rounded-[24px] border border-white/10 bg-[#171a21] shadow-[0_16px_38px_rgba(0,0,0,.18)] md:col-span-4"
                        :class="[
                            item.type !== 'image'
                                ? 'md:col-span-6'
                                : index % 10 === 0 || index % 10 === 1
                                ? 'md:col-span-6 h-[580px]'
                                : index % 10 === 2 || index % 10 === 3 || index % 10 === 4
                                    ? 'md:col-span-4 h-[285px]'
                                    : index % 10 === 5 || index % 10 === 6 || index % 10 === 7
                                        ? 'md:col-span-4 h-[420px]'
                                        : 'md:col-span-6 h-[360px]',
                        ]"
                    >
                        <img
                            v-if="item.type === 'image'"
                            :src="item.url"
                            :alt="item.caption || 'Фото из галереи'"
                            class="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                        <video
                            v-else-if="item.type === 'video'"
                            :src="item.url"
                            controls
                            playsinline
                            preload="metadata"
                            class="max-h-[520px] w-full object-contain"
                        />
                        <div v-else-if="item.type === 'audio'" class="flex min-h-48 items-center p-6">
                            <audio :src="item.url" controls preload="metadata" class="w-full" />
                        </div>

                        <figcaption
                            v-if="item.caption"
                            class="rounded-xl bg-black/55 px-4 py-3 text-sm font-semibold text-white backdrop-blur-md"
                            :class="item.type === 'image' ? 'absolute bottom-4 left-4 right-4' : ''"
                        >
                            {{ item.caption }}
                        </figcaption>
                    </figure>
                </div>
            </section>

            <section
                v-if="memorial.package_code === 'legacy'"
                id="memories"
                class="mx-auto max-w-7xl px-5 py-20"
            >
                <div class="mb-8">
                    <p
                        class="text-sm font-bold uppercase tracking-[.18em] text-[#d6b27b]"
                    >
                        Память близких
                    </p>

                    <h2 class="mt-3 font-serif text-3xl font-bold md:text-5xl">
                        Каким его вспоминают друзья и родные
                    </h2>

                    <p class="max-w-[760px] text-[18px] text-[#B4BAC7]">
                        В этих словах — неформальная правда о человеке:
                        надёжность, юмор, глубина, свет и редкое умение делать
                        рядом теплее.
                    </p>
                </div>

                <div class="grid gap-5 md:grid-cols-2">
                    <blockquote
                        v-for="quote in memorial.quotes"
                        :key="quote.id"
                        class="rounded-3xl border border-white/10 bg-white/[.04] p-6"
                    >
                        <p class="text-white/80">“{{ quote.text }}”</p>

                        <footer class="mt-5">
                            <strong>{{ quote.author_name }}</strong>
                            <p class="text-sm text-white/45">
                                {{ quote.author_relation }}
                            </p>
                        </footer>

                        <img
                            v-if="quote.media_url && quote.media_url.match(/\.(jpg|jpeg|png|webp)(\?|$)/i)"
                            :src="quote.media_url"
                            class="mt-4 max-h-80 rounded-2xl object-cover"
                        />

                        <video
                            v-else-if="quote.media_url && quote.media_url.match(/\.(mp4|mov)(\?|$)/i)"
                            :src="quote.media_url"
                            controls
                            class="mt-4 w-full rounded-2xl"
                        />

                        <audio
                            v-else-if="quote.media_url"
                            :src="quote.media_url"
                            controls
                            class="mt-4 w-full"
                        />
                    </blockquote>
                </div>

                <form
                    class="mt-10 rounded-3xl bg-white p-6 text-black"
                    @submit.prevent="sendQuote"
                >
                    <h3 class="text-2xl font-bold">
                        Оставить воспоминание
                    </h3>

                    <input
                        v-model="quoteForm.author_name"
                        class="mt-5 w-full rounded-2xl border px-4 py-3"
                        placeholder="Ваше имя"
                        required
                    />

                    <input
                        v-model="quoteForm.author_relation"
                        class="mt-4 w-full rounded-2xl border px-4 py-3"
                        placeholder="Кем вы приходитесь"
                    />

                    <textarea
                        v-model="quoteForm.text"
                        class="mt-4 min-h-32 w-full rounded-2xl border px-4 py-3"
                        placeholder="Ваше воспоминание"
                        required
                    ></textarea>

                    <label class="mt-4 block text-sm font-semibold">
                        Прикрепить фото, видео или аудио

                        <input
                            class="mt-2 block w-full text-sm"
                            ref="quoteMediaInput"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,audio/mpeg,audio/mp4,audio/wav,audio/ogg"
                            :disabled="quoteSending"
                            @change="selectQuoteMedia"
                        />

                        <span
                            v-if="quoteMedia"
                            class="mt-1 block font-normal text-slate-500"
                        >
                            {{ quoteMedia.name }}
                        </span>
                    </label>

                    <div v-if="quoteMediaPreview" class="mt-4 space-y-3">
                        <img v-if="quoteMedia.type.startsWith('image/')" :src="quoteMediaPreview" alt="Прикреплённое фото" class="max-h-80 rounded-2xl" />
                        <video v-else-if="quoteMedia.type.startsWith('video/')" :src="quoteMediaPreview" controls playsinline class="max-h-80 w-full rounded-2xl" />
                        <audio v-else :src="quoteMediaPreview" controls class="w-full" />
                        <button type="button" class="text-sm text-red-600" :disabled="quoteSending" @click="clearQuoteMedia">Убрать вложение</button>
                    </div>
                    <p class="mt-2 text-sm text-slate-500">Один файл: JPG, PNG, WebP, MP4, MOV, MP3, M4A, WAV или OGG. Общий лимит вложений ко всем воспоминаниям — 100 МБ, отдельно от галереи.</p>
                    <p v-if="quoteError" role="alert" class="mt-4 text-sm text-red-600">{{ quoteError }}</p>
                    <button
                        class="mt-5 rounded-full bg-black px-6 py-3 text-white disabled:opacity-50"
                        :disabled="quoteSending"
                    >
                        {{ quoteSending ? 'Отправка…' : 'Отправить на модерацию' }}
                    </button>

                    <p
                        v-if="quoteSuccess"
                        class="mt-4 text-sm text-green-600"
                    >
                        Спасибо. Ваше воспоминание появится после модерации.
                    </p>
                </form>
            </section>

            <section class="mx-auto max-w-7xl px-5 py-24 text-center">
                <div
                    class="rounded-[32px] border border-white/10 bg-white/[.04] p-10"
                >
                    <h3 class="font-serif text-3xl font-bold md:text-4xl">
                        Некоторые люди уходят слишком рано.<br />
                        Но их свет остаётся надолго.
                    </h3>
                </div>
            </section>
        </template>
    </main>
</template>