<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api, uploadImage } from '../../api/client';
import DashboardLayout from '../../layouts/DashboardLayout.vue';
import QrcodeVue from 'qrcode.vue';

const route = useRoute();
const router = useRouter();
const id = computed(() => route.params.id);
const error = ref('');
const uploadingMainPhoto = ref(false);
const qrBoxRef = ref(null);

const form = reactive({
    full_name: '',
    slug: '',
    birth_date: '',
    death_date: '',
    main_photo: '',
    short_description: '',
    biography: '',
    closing_text: '',
    facts: [
        { 
            title: 'Человек света', text: 'Близкие вспоминают его как открытого и доброго человека.' 
        },
    ],
    qualities: ['Доброта', 'Сила', 'Любовь к жизни'],
    photos: [],
    timelines: [],
    quotes: [],
    life_sections: [],
});

const addPhoto = () => form.photos.push({ image: '', caption: '' });
const addTimeline = () => form.timelines.push({ period: '', description: '' });
const addQuote = () => form.quotes.push({ author_name: '', author_relation: '', text: '' });

const load = async () => {
    if (!id.value) return;
    
    const { data } = await api.get(`/memorials/${id.value}`);
    
    Object.assign(form, {
        ...data,
        birth_date: data.birth_date || '',
        death_date: data.death_date || '',
        facts: data.facts || [],
        qualities: data.qualities || [],
        photos: data.photos || [],
        timelines: data.timelines || [],
        quotes: data.quotes || [],
        life_sections: data.life_sections || data.lifeSections || [],
    });
};

const save = async () => {
    try {
        error.value = '';

        if (id.value) await api.put(`/memorials/${id.value}`, form);
            else await api.post('/memorials', form);
        
        router.push('/dashboard');
    } catch (e) {
        error.value = e.response?.data?.message || 'Ошибка сохранения';
    }
};

const handleMainPhotoUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
        uploadingMainPhoto.value = true;

        form.main_photo = await uploadImage(file);
    } catch (e) {      
        console.log(e);

        error.value = e.response?.data?.message || 'Не удалось загрузить фото';
        alert(error.value);
    } finally {
        uploadingMainPhoto.value = false;
    }
};

const handleGalleryPhotoUpload = async (event, item) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
        item.image = await uploadImage(file);
    } catch (e) {
        console.log(e);

        error.value = 'Не удалось загрузить фото';
        alert(error.value);
    }
};

const addFact = () => {
    if (!Array.isArray(form.facts)) {
        form.facts = [];
    }

    form.facts.push({
        title: '',
        text: '',
    });
};

const removeFact = (index) => {
    form.facts.splice(index, 1);
};

const publicUrl = computed(() => {
    if (!form.slug) return '';

    const siteOrigin = import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin;

    return `${siteOrigin}/m/${form.slug}`;
});

const downloadQr = async () => {
    const canvas = qrBoxRef.value?.querySelector('canvas');

    if (!canvas) {
        alert('QR-код еще не готов');
        return;
    }

    const originalValue = publicUrl.value;

    const bigCanvas = document.createElement('canvas');
    const size = 2000;

    bigCanvas.width = size;
    bigCanvas.height = size;

    const ctx = bigCanvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const img = new Image();

    img.src = canvas.toDataURL('image/png');

    img.onload = () => {
        ctx.drawImage(img, 0, 0, size, size);

        const link = document.createElement('a');

        link.download = `memorial-${form.slug || 'qr'}-qr.png`;
        link.href = bigCanvas.toDataURL('image/png');

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
};

const addQuality = () => {
    if (!Array.isArray(form.qualities)) {
        form.qualities = [];
    }

    form.qualities.push('');
};

const removeQuality = (index) => {
    form.qualities.splice(index, 1);
};

const addLifeSection = () => {
    if (!Array.isArray(form.life_sections)) {
        form.life_sections = [];
    }

    form.life_sections.push({
        title: '',
        text: '',
        sort_order: form.life_sections.length,
    });
};

const removeLifeSection = (index) => {
    form.life_sections.splice(index, 1);
};

onMounted(load);
</script>
<template>
    <DashboardLayout>
        <div class="mb-6">
            <router-link to="/dashboard" class="text-sm font-semibold text-slate-500"
                >← Назад</router-link
            >
            <h1 class="mt-2 text-3xl font-bold">{{ id ? 'Редактировать анкету' : 'Новая анкета' }}</h1>
        </div>

        <form class="grid gap-6 lg:grid-cols-[1fr_360px]" @submit.prevent="save">
            <div class="space-y-6">
                <section class="card space-y-4">
                    <h2 class="text-xl font-bold">Основная информация</h2>
                    
                    <label class="block">
                        <span class="label">ФИО</span>
                        <input class="input mt-1" v-model="form.full_name" />
                    </label>

                    <label class="block">
                        <span class="label">Slug</span>
                        <input class="input mt-1" v-model="form.slug" placeholder="pak-kirill"/>
                    </label>

                    <div class="grid gap-4 md:grid-cols-2">
                        <label>
                            <span class="label">Дата рождения</span>
                            <input class="input mt-1" type="date" v-model="form.birth_date" />
                        </label>
                        
                        <label>
                            <span class="label">Дата смерти</span>
                            <input class="input mt-1" type="date" v-model="form.death_date" />
                        </label>
                    </div>

                    <label class="block">
                        <span class="label">Главное фото</span>
                        <input type="file" accept="image/*" class="input mt-1" @change="handleMainPhotoUpload" />
                        <p v-if="uploadingMainPhoto" class="mt-2 text-sm text-slate-500">Загрузка...</p>
                        <img v-if="form.main_photo" :src="form.main_photo" class="mt-4 h-56 w-full rounded-2xl object-cover" />
                    </label>
                    
                    <label class="block">
                        <span class="label">Короткое описание</span>
                        <textarea class="input mt-1 min-h-24" v-model="form.short_description"></textarea>
                    </label>                    
                </section>

                <section class="card space-y-4">
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="label">Факты</span>
                            <button type="button" class="btn-secondary !py-2" @click="addFact">Добавить факт</button>
                        </div>

                        <div
                            v-for="(fact, index) in form.facts"
                            :key="index"
                            class="grid gap-3 rounded-2xl border border-gray-200 p-4 md:grid-cols-2"
                        >
                            <label class="block">
                                <span class="label">Заголовок</span>
                                <input
                                    class="input mt-1"
                                    v-model="fact.title"
                                    placeholder="Например: Любимый город"
                                />
                            </label>

                            <label class="block">
                                <span class="label">Текст</span>
                                <textarea
                                    class="input mt-1 min-h-24"
                                    v-model="fact.text"
                                    placeholder="Например: Алматы"
                                ></textarea>
                            </label>

                            <div class="md:col-span-2">
                                <button
                                    type="button"
                                    class="text-sm text-red-500"
                                    @click="removeFact(index)"
                                >
                                    Удалить
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="card space-y-4">
                    <h2 class="text-xl font-bold">Биография</h2>
                    <textarea class="input min-h-48" v-model="form.biography"></textarea>
                </section>

                <section class="card space-y-4">
                    <div class="flex justify-between">
                        <h2 class="text-xl font-bold">Хронология</h2>
                        <button type="button" class="btn-secondary !py-2" @click="addTimeline">Добавить</button>
                    </div>
                    <div v-for="(item, i) in form.timelines" :key="i" class="grid gap-3 rounded-2xl bg-slate-50 p-4">
                        <input class="input" v-model="item.period" placeholder="Период" />
                        <textarea class="input" v-model="item.description" placeholder="Описание"></textarea>
                    </div>
                </section>

                <section class="card space-y-4">
                    <div class="flex justify-between">
                        <h2 class="text-xl font-bold">Фото</h2>

                        <button type="button" class="btn-secondary !py-2" @click="addPhoto">Добавить</button>
                    </div>

                    <div v-for="(item, i) in form.photos" :key="i" class="grid gap-3 rounded-2xl bg-slate-50 p-4">
                        <input type="file" accept="image/*" class="input" @change="(e) => handleGalleryPhotoUpload(e, item)" />
                        <img v-if="item.image" :src="item.image" class="h-48 w-full rounded-2xl object-cover" />
                        <input class="input" v-model="item.caption" placeholder="Подпись" />
                    </div>
                </section>

                <section class="card space-y-4">
                    <div class="flex items-center justify-between">

                        <div>
                            <h2 class="text-xl font-bold">Этапы жизни</h2>
                        </div>

                        <button
                            type="button"
                            class="btn-secondary !py-2"
                            @click="addLifeSection"
                        >
                            Добавить
                        </button>
                    </div>

                    <div
                        v-for="(item, i) in form.life_sections"
                        :key="i"
                        class="grid gap-3 rounded-2xl border border-gray-200 bg-slate-50 p-4"
                    >

                        <div class="grid gap-3 md:grid-cols-[180px_1fr]">

                            <label class="block">
                                <span class="label">Заголовок</span>

                                <input
                                    class="input mt-1 uppercase"
                                    v-model="item.title"
                                    placeholder="АЛМАТЫ"
                                />
                            </label>

                            <label class="block">
                                <span class="label">Описание</span>

                                <textarea
                                    class="input mt-1 min-h-24"
                                    v-model="item.text"
                                    placeholder="Описание этапа жизни..."
                                ></textarea>
                            </label>
                        </div>

                        <div class="flex justify-end">
                            <button
                                type="button"
                                class="text-sm text-red-500"
                                @click="removeLifeSection(i)"
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                </section>

                <section class="card space-y-4">
                    <div class="flex items-center justify-between">
                        <h2 class="text-xl font-bold">Качества</h2>

                        <button
                            type="button"
                            class="btn-secondary !py-2"
                            @click="addQuality"
                        >
                            Добавить качество
                        </button>
                    </div>

                    <div
                        v-for="(quality, index) in form.qualities"
                        :key="index"
                        class="flex gap-3 rounded-2xl border border-gray-200 p-4"
                    >
                        <input
                            class="input"
                            v-model="form.qualities[index]"
                            placeholder="Например: Доброта"
                        />

                        <button
                            type="button"
                            class="text-sm text-red-500"
                            @click="removeQuality(index)"
                        >
                            Удалить
                        </button>
                    </div>
                </section>

                <section class="card space-y-4">
                    <div class="flex justify-between">
                        <h2 class="text-xl font-bold">Воспоминания</h2>
                        <button type="button" class="btn-secondary !py-2" @click="addQuote">Добавить</button>
                    </div>
                    <div v-for="(item, i) in form.quotes" :key="i" class="grid gap-3 rounded-2xl bg-slate-50 p-4">
                        <input class="input" v-model="item.author_name" placeholder="Автор" />
                        <input class="input" v-model="item.author_relation" placeholder="Кем приходится" />
                        <textarea class="input" v-model="item.text" placeholder="Текст"></textarea>
                    </div>
                </section>
            </div>

            <aside class="space-y-4">
                <div class="card sticky top-6">
                    <h2 class="text-xl font-bold">Сохранение</h2>
                    <p class="mt-2 text-sm text-slate-500">
                        После сохранения можно публиковать страницу по ссылке.
                    </p>                
                    <p v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</p>                    
                    <button class="btn-primary mt-5 w-full">Сохранить</button>
                </div>

                <div class="card">
                    <h3 class="font-bold">Предпросмотр</h3>
                    <div class="mt-4 overflow-hidden rounded-2xl bg-[#0f1115] text-white">
                        <img v-if="form.main_photo" :src="form.main_photo" class="h-48 w-full object-cover" />
                            <div class="p-4">
                            <p class="font-serif text-2xl">{{ form.full_name || 'ФИО' }}</p>
                            <p class="text-sm text-white/60">{{ form.birth_date }} — {{ form.death_date }}</p>
                        </div>
                    </div>
                </div>

                <div v-if="form.slug" class="card">
                    <h3 class="font-bold">QR-код страницы</h3>

                    <p class="mt-2 text-sm text-slate-500">
                        QR-код ведет на публичную страницу мемориала.
                    </p>

                    <div class="mt-4 flex justify-center">
                        <div ref="qrBoxRef" class="rounded-2xl bg-white p-3 shadow">
                            <QrcodeVue
                                ref="qrRef"
                                :value="publicUrl"
                                :size="220"
                                level="H"
                            />
                        </div>
                    </div>

                    <p class="mt-4 break-all text-center text-sm text-slate-500">
                        {{ publicUrl }}
                    </p>

                    <button
                        type="button"
                        class="btn-secondary mt-4 w-full"
                        @click="downloadQr"
                    >
                        Скачать QR
                    </button>
                </div>
            </aside>
        </form>
    </DashboardLayout>
</template>
