<template>
    <Toast />
    <div>
        <div id="input" class="col-12 md:col-4 input">
            <div class="p-inputgroup">
                <span class="p-inputgroup-addon">
                    <i class="pi pi-calculator"></i>
                </span>
                <InputText placeholder="Your formula" ref="input"
                    v-tooltip.top="`Supported characters are: 'a-Z' and '¬∧∨⇒()'`" v-model="msg" />
                <Button icon="pi pi-check" class="p-button-success" @click="sendMsg" />
            </div>
        </div>

        <div class="grid buttons">
            <div class="col-12">
                <div class="p-inputgroup">
                    <Button label="A" class="p-button-outlined p-button-raised" @click="this.addSymbol('A')" />
                    <Button label="B" class="p-button-outlined p-button-raised" @click="this.addSymbol('B')" />
                    <Button label="C" class="p-button-outlined p-button-raised" @click="this.addSymbol('C')" />
                    <Button label="D" class="p-button-outlined p-button-raised" @click="this.addSymbol('D')" />
                    <Button label="¬" class="p-button-outlined p-button-raised" @click="this.addSymbol('¬')" />
                    <Button label="∧" class="p-button-outlined p-button-raised" @click="this.addSymbol('∧')" />
                    <Button label="∨" class="p-button-outlined p-button-raised" @click="this.addSymbol('∨')" />
                    <Button label="⇒" class="p-button-outlined p-button-raised" @click="this.addSymbol('⇒')" />
                    <Button label="(" class="p-button-outlined p-button-raised" @click="this.addSymbol('(')" />
                    <Button label=")" class="p-button-outlined p-button-raised" @click="this.addSymbol(')')" />
                    <Button id="deleteBtn" icon="pi pi-delete-left" class="p-button-raised  p-button-warning"
                        @click="this.removeLastSymbol()" />
                    <Button icon="pi pi-trash" class="p-button-danger p-button-raised" @click="toggleOverlay" />
                </div>
                <div>
                    <OverlayPanel ref="op" :dismissable="true" appendTo="body" :showCloseIcon="false"
                        id="overlay_panel">
                        <Button icon="pi pi-trash" class="p-button-danger p-button-raised"
                            @click="this.removeAllSymbols()" />
                    </OverlayPanel>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
//<Button type="button" label="Toggle" @click="toggle" />  style="width: 450px"   :breakpoints="{'960px': '75vw'}"      <Button type="button" icon="pi pi-search" :label="selectedProduct ? selectedProduct.name : 'S'" @click="toggleOverlay" aria-haspopup="true" aria-controls="overlay_panel" />

export default {
    name: "InputDiv",
    data: function () {
        return {
            msg: '',
        }
    },
    methods: {
        addSymbol(letter) {
            this.msg += letter;
            this.$refs.input.$el.focus();
        },

        removeLastSymbol() {
            this.msg = this.msg.slice(0, -1);
            this.$refs.input.$el.focus();
        },

        removeAllSymbols() {
            this.msg = "";
            this.$refs.op.hide();
            this.$refs.input.$el.focus();
        },

        toggleOverlay(event) {
            this.$refs.op.toggle(event);
        },

        sendMsg() {
            if (!this.checkMsg()) return false;


        },

        checkMsg() {
            let result = true;
            let closures = 0;
            let wasLetter = false;
            let validClosures = true;
            let validNeg = true;
            let validCorrectChars = true;
            let validDoubleChars = true;
            let validOperands = true;

            for (let i = 0; i < this.msg.length; i++) {
                //console.log(i+ ". is alpha: " + checkCharacters(this.msg[i]));
                //console.log(i+ ". is correct: " + checkCorrectChars(this.msg[i]));
                if (!checkCorrectChars(this.msg[i])) validCorrectChars = false;
                if (!checkDoubleChars(this.msg[i])) validDoubleChars = false;
                //console.log(i+ ". is Closure: " + checkClosure(this.msg[i]));
                if (!checkClosure(this.msg[i])) validClosures = false;
                if (i + 1 < this.msg.length && !checkNeg(this.msg[i], this.msg[i + 1])) validNeg = false;
                if (i + 1 < this.msg.length && i - 1 >= 0 && !checkOperands(this.msg[i - 1], this.msg[i], this.msg[i + 1])) validOperands = false;
            }


            if (!wasLetter) validDoubleChars = false;
            if (closures > 0) validClosures = false;
            if (this.msg[this.msg.length - 1] == '¬') validNeg = false;
            result = (validClosures && validCorrectChars && validDoubleChars && validNeg && validOperands);

            if (!validCorrectChars)
                this.$toast.add({ severity: 'error', summary: 'Wrong Input', detail: 'Wrong characters', life: 3000 });
            else if (!validClosures)
                this.$toast.add({ severity: 'error', summary: 'Wrong Input', detail: 'Wrong closures', life: 3000 });
            else if (!validNeg)
                this.$toast.add({ severity: 'error', summary: 'Wrong Input', detail: 'Wrong position of negations', life: 3000 });
            else if (!validDoubleChars)
                this.$toast.add({ severity: 'error', summary: 'Wrong Input', detail: 'Wrong position of variables/operands', life: 3000 });
            else if (!validOperands)
                this.$toast.add({ severity: 'error', summary: 'Wrong Input', detail: 'Wrong position of operands', life: 3000 });


            /* console.log("validOperands: " + validOperands);
             console.log("validDoubleChars: " + validDoubleChars);
             console.log("CorrectChars: " + validCorrectChars);
             console.log("Closure: " + validClosures);
             console.log("Neg: " + validNeg);
             console.log("**********");*/
            console.log("result: " + result);

            // console.log("******************************************************");

            return true;

            function checkClosure(letter) {
                if (letter == '(') closures++;
                if (letter == ')') closures--;
                return !(closures < 0)
            }

            function checkCorrectChars(letter) {
                let correctChars = ['¬', '∧', '∨', '⇒', '(', ')'];
                return (checkCharacters(letter) || correctChars.includes(letter));
            }

            function checkDoubleChars(letter) {
                let operands = ['∧', '∨', '⇒'];
                if (!checkCharacters(letter) && !operands.includes(letter)) return true;
                if (checkCharacters(letter) && wasLetter == false) { wasLetter = true; return true; }
                if (operands.includes(letter) && wasLetter == true) { wasLetter = false; return true; }
                return false;
            }

            function checkNeg(letter, nextLetter) {
                return letter != '¬' || (letter == '¬' && (checkCharacters(nextLetter) || nextLetter == '('));
            }

            function checkOperands(perviousLetter, letter, nextLetter) {
                let operands = ['∧', '∨', '⇒'];
                if (!operands.includes(letter)) return true;
                return operands.includes(letter) && (checkCharacters(perviousLetter) || perviousLetter == ')') && (checkCharacters(nextLetter) || nextLetter == '(' || nextLetter == '¬');
            }

            function checkCharacters(letter) {
                if (letter.toUpperCase().match(/[a-z]/i))
                    return true; else return false;
            }
        }
    }
}
</script>

<style>
.p-speeddial-button.p-button.p-button-icon-only {
    display: none;
}

.buttons {
    margin-top: 5px;
    grid-gap: 5px;
}

.p-inputgroup>button {
    margin: 1px !important;
}

.p-button.p-button-warning,
.p-buttonset.p-button-warning>.p-button,
.p-splitbutton.p-button-warning>.p-button {
    border: 1px solid #B98607;
}

.p-button.p-button-danger,
.p-buttonset.p-button-danger>.p-button,
.p-splitbutton.p-button-danger>.p-button {
    border: 1px solid #A60606;
}


#deleteBtn {
    color: #fff;
}
</style>