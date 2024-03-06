<template>
    <div class="resolution-text-area-width flex-auto items-center justify-center mx-auto">
    <h4 class="text-center mt-4">{{ title }}</h4>
    <textarea wrap="soft" rows="4" disabled class="block p-2.5 w-full text-sm text-gray-900 rounded-lg 
              border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 
              dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        type="text">{{ text }} </textarea>

    <button id="copyToClipboard-a" type="button" :class="{ 'border-green-700': clipboard }" class="clipboard icon 
        js-clipboard p-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-full border 
        border-blue-500 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none 
        dark:bg-slate-900 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 dark:focus:outline-none 
        dark:focus:ring-1 dark:focus:ring-gray-600" data-clipboard-target="#hs-clipboard-basic"
        data-clipboard-action="copy" data-clipboard-success-text="Copied" @click="copyToClipboard(text)">
        <svg v-if="!clipboard" style="color: #2196f3;"
            class="js-clipboard-default w-4 h-4 group-hover:rotate-6 transition text-blue-500"
            xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        </svg>
        <svg v-else class="js-clipboard-success w-4 h-4 text-green-700" xmlns="http://www.w3.org/2000/svg" width="24"
            height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"
            stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    </button>
</div>
</template>

<script>
export default {
    props:['title', 'text'],
    data() {
        return {
            clipboard: false,
        };
    },
    components: {
    },
    methods: {
        copyToClipboard(text) {
            if (navigator.clipboard && text.length > 0 && !this.clipboard) {
                navigator.clipboard.writeText(text)
                this.clipboard = true;
                setTimeout(() => {
                    this.clipboard = false;
                }, 1000);
            }
            return
        }
    },
};
</script>
<style>
.resolution-text-area-width{
    width: 100%;
}

.clipboard {
  position: absolute;
  bottom: 10px;
  right: 10px;
  margin-top: 4px;
  margin-left: 4px;
  border-radius: 25px !important;
}
</style>