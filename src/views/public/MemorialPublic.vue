<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { api } from "../../api/client";

const route = useRoute();
const memorial = ref(null);
const loading = ref(true);
const error = ref("");

const formatDate = (v) =>
    v
        ? new Date(v).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        : "";

onMounted(async () => {
    try {
        const { data } = await api.get(`/public/memorials/${route.params.slug}`);
        memorial.value = data;
    } catch (e) {
        error.value = "Страница не найдена или не опубликована";
    } finally {
        loading.value = false;
    }
});
</script>
<template>
    <main class="min-h-screen bg-[radial-gradient(circle_at_20%_10%,rgba(214,178,123,0.22),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(120,91,60,0.18),transparent_32%),linear-gradient(135deg,#0f1115_0%,#17130f_45%,#090a0d_100%)] text-white">
        <div v-if="loading" class="p-10 text-center text-white/60">Загрузка...</div>
        <div v-else-if="error" class="p-10 text-center text-white/60">
        {{ error }}
        </div>

        <template v-else>
            <section class="relative overflow-hidden py-12 md:py-20">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(214,178,123,0.18),transparent_30%)]"></div>
                <div class="relative mx-auto grid max-w-7xl items-center gap-10 px-5 lg:grid-cols-[1.05fr_.95fr]">

                    <div>
                        <div class="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                            Светлая память • История жизни
                        </div>

                        <h1 class="font-serif font-bold text-5xl leading-none tracking-tight md:text-7xl">
                            {{ memorial.full_name }}
                        </h1>
                        <p class="mt-5 text-xl text-[#d7dce6]">
                            {{ formatDate(memorial.birth_date) }} —
                            {{ formatDate(memorial.death_date) }}
                        </p>
                        <p class="mt-5 max-w-2xl text-lg text-[#d7dce6] md:text-xl">
                            {{ memorial.short_description }}
                        </p>

                        <div class="mt-8 flex flex-wrap gap-4">
                            <a href="#story" class="rounded-full bg-[#d6b27b] px-6 py-3 font-semibold text-[#15120d]">История жизни</a>
                            <a href="#memories" class="rounded-full border border-white/10 bg-white/5 px-6 py-3 font-semibold">Воспоминания друзей</a>
                        </div>

                        <div class="mt-8 grid gap-4 md:grid-cols-3">
                            <div v-for="fact in memorial.facts" :key="fact.title" class="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <strong>{{ fact.title }}</strong>
                                <p class="mt-1 text-sm text-white/55">{{ fact.text }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="relative min-h-[700px] overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl">
                        <img v-if="memorial.main_photo" :src="memorial.main_photo" class="absolute inset-0 h-full w-full object-cover"/>
                        <div class="absolute inset-x-5 bottom-5 rounded-3xl border border-white/10 bg-black/45 p-5 backdrop-blur">
                            <p>«Такие люди не уходят — они остаются внутри»</p>
                        </div>
                    </div>
                </div>
            </section>
            
            <section id="story" class="mx-auto max-w-7xl px-5 py-20">
                <div class="mb-8">
                    <p class="text-sm font-bold uppercase tracking-[.18em] text-[#d6b27b]">История</p>
                    <h2 class="mt-3 font-serif font-bold text-5xl">Жизнь, в которой было много движения, тепла и людей</h2>
                </div>

                <div class="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
                    <article class="rounded-3xl border border-white/10 bg-white/[.04] p-7 text-[#d7dce6]">
                        <p class="whitespace-pre-line">{{ memorial.biography }}</p>
                    </article>

                    <aside class="rounded-3xl border border-white/10 bg-white/[.04] p-7">
                        <div v-for="item in memorial.timelines" :key="item.id" class="border-b border-white/10 py-4 last:border-0">
                            <p class="text-sm font-bold uppercase text-[#d6b27b]">{{ item.period }}</p>
                            <p class="mt-2 text-[#d7dce6]">{{ item.description }}</p>
                        </div>
                    </aside>
                </div>
            </section>

            <section id="story" class="mx-auto max-w-7xl px-5 py-20">
                <div class="mb-8">
                    <p class="text-sm font-bold uppercase tracking-[.18em] text-[#d6b27b]">Путь</p>
                    <h2 class="mt-3 font-serif font-bold text-5xl">Ключевые этапы его истории</h2>
                </div>
                
                <div class="rounded-[28px] border border-white/10 bg-white/[.04] p-7 md:p-8">
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

                    <div v-if="memorial.qualities?.length" class="grid gap-3 pt-6 md:grid-cols-3">
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
                    <p class="text-sm font-bold uppercase tracking-[.18em] text-[#d6b27b]">Галерея</p>
                    <h2 class="mt-3 font-serif text-4xl md:text-5xl">Моменты, в которых чувствуется его характер</h2>
                    <p class="max-w-[760px] m-0 text-[18px] text-[#B4BAC7]">Дружба, семья, праздники, искренний смех, лёгкость и любовь к жизни.</p>
                </div>

                <div class="grid grid-cols-12 gap-5">
                    <figure
                        v-for="(photo, i) in memorial.photos"
                        :key="photo.id || i"
                        class="group relative col-span-12 overflow-hidden rounded-[24px] border border-white/10 bg-[#171a21] shadow-[0_16px_38px_rgba(0,0,0,.18)] md:col-span-4"
                        :class="[
                            i % 10 === 0 || i % 10 === 1
                            ? 'md:col-span-6 h-[580px]'
                            : i % 10 === 2 || i % 10 === 3 || i % 10 === 4
                                ? 'md:col-span-4 h-[285px]'
                                : i % 10 === 5 || i % 10 === 6 || i % 10 === 7
                                ? 'md:col-span-4 h-[420px]'
                                : 'md:col-span-6 h-[360px]'
                        ]"
                    >
                        <img :src="photo.image" class="h-full w-full object-cover transition duration-700 group-hover:scale-105"/>
                        <div v-if="photo.caption" class="absolute bottom-4 left-4 right-4 rounded-xl bg-black/55 px-4 py-3 text-sm font-semibold text-white backdrop-blur-md">
                            {{ photo.caption }}
                        </div>
                    </figure>
                </div>
            </section>

            <section id="memories" class="mx-auto max-w-7xl px-5 py-20">
                <div class="mb-8">
                    <p class="text-sm font-bold uppercase tracking-[.18em] text-[#d6b27b]">Память близких</p>
                    <h2 class="mt-3 font-serif font-bold text-5xl ">Каким его вспоминают друзья и родные</h2>
                    <p class="max-w-[760px] m-0 text-[18px] text-[#B4BAC7]">В этих словах — неформальная правда о человеке: надёжность, юмор, глубина, свет и редкое умение делать рядом теплее.</p>
                </div>
                <div class="grid gap-5 md:grid-cols-2">
                    <blockquote v-for="quote in memorial.quotes" :key="quote.id" class="rounded-3xl border border-white/10 bg-white/[.04] p-6">
                        <p class="text-white/80">“{{ quote.text }}”</p>
                        
                        <footer class="mt-5">
                            <strong>{{ quote.author_name }}</strong>
                            <p class="text-sm text-white/45">{{ quote.author_relation }}</p>
                        </footer>
                    </blockquote>
                </div>
            </section>

            <section class="mx-auto max-w-7xl px-5 py-24 text-center">
                <div class="rounded-[32px] border border-white/10 bg-white/[.04] p-10">
                    <h3 class="font-serif font-bold text-4xl">Некоторые люди уходят слишком рано.<br>Но их свет остаётся надолго.</h3>
                </div>
            </section>
        </template>
    </main>
</template>
