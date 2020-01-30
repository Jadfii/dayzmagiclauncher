<template>
    <transition name="fade">
        <div v-if="show" class="position-fixed d-flex align-items-center justify-content-center" style="z-index: 2; top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100vh;">
            <div class="modal-backdrop show"></div>
            <div class="modal modal-xl position-relative d-flex">
                <div class="modal-dialog modal-dialog-centered" style="width: auto !important;">
                    <div class="modal-content border-0 bg-4">
                        <div class="modal-header d-flex flex-column">
                            <h5 class="modal-title">Select character</h5>
                            <p class="mb-0">Pick a model for your character to spawn with.</p>
                        </div>
                        <div class="modal-body d-flex flex-column">
                            <div class="mt-2 position-relative" style="max-width: 750px;">
                                <a v-for="character in available_characters" :key="character" @click="selected_character = character" href="javascript:void(0);">
                                    <img :class="{ 'border-primary': character == selected_character }" :src="`https://s3.eu-west-2.amazonaws.com/dayz-magic-launcher/characters/${normaliseCharacter(character)}.png`" data-toggle="tooltip" data-placement="top" :title="normaliseCharacter(character)" class="rounded-circle m-2" style="object-fit: cover; width: 70px; height: 70px;">
                                </a>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" @click="close">Cancel</button>
                            <button type="button" class="btn btn-primary" @click="complete">Pick character</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
    import { EventBus } from './../../event-bus.js';

    export default {
        data () {
            return {
                show: false,
                resolve: null,
                reject: null,
                selected_character: null,
                available_characters: [
                    "SurvivorM_Mirek",
                    "SurvivorM_Boris",
                    "SurvivorM_Cyril",
                    "SurvivorM_Denis",
                    "SurvivorM_Elias",
                    "SurvivorM_Francis",
                    "SurvivorM_Guo",
                    "SurvivorM_Hassan",
                    "SurvivorM_Indar",
                    "SurvivorM_Jose",
                    "SurvivorM_Kaito",
                    "SurvivorM_Lewis",
                    "SurvivorM_Manua",
                    "SurvivorM_Niki",
                    "SurvivorM_Oliver",
                    "SurvivorM_Peter",
                    "SurvivorM_Quinn",
                    "SurvivorM_Rolf",
                    "SurvivorM_Seth",
                    "SurvivorM_Taiki",
                    "SurvivorF_Eva",
                    "SurvivorF_Frida",
                    "SurvivorF_Gabi",
                    "SurvivorF_Helga",
                    "SurvivorF_Irena",
                    "SurvivorF_Judy",
                    "SurvivorF_Keiko",
                    "SurvivorF_Linda",
                    "SurvivorF_Maria",
                    "SurvivorF_Naomi"
                ],
            }
        },
        watch: {
            show(val) {
                if (val) EventBus.$emit('closeModal');
            }
        },
        methods: {
            normaliseCharacter(character) {
                return character.replace('SurvivorM_', '').replace('SurvivorF_', '');
            },
            open() {
                this.show = true;
            },
            close() {
                this.show = false;
                this.reject();
            },
            toggle() {
                this.show = !this.show;
            },
            prompt(character) {
                this.selected_character = this.available_characters[0];
                if (typeof character !== 'undefined' && character !== null && character.trim() !== '') this.selected_character = character;
                this.open();
                return new Promise((resolve, reject) => {
                    this.resolve = resolve;
                    this.reject = reject;
                });
            },
            complete() {
                this.resolve(this.selected_character);
                this.close();
            },
        },
    }
</script>