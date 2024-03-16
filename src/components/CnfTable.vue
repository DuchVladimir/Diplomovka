<template>
    <div class="flex flex-col" v-if="treeData">
        <div class="-m-1.5 overflow-x-auto">
            <div class="p-1.5 min-w-full inline-block align-middle">
                <PrimeButton :label="buttonLabel.value" :class="{
        'border-green-700 text-green-700 important-hover': !buttonLabel.isDefault
    }" class="p-2 pr-4 mb-3 pl-4 rounded-lg border copy-button border-gray-200 no-select p-button-outlined p-button-raised md:me-1"
                        @click="clipboardInputLatex()" />
                <div class="border rounded-lg overflow-hidden dark:border-gray-700">

                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                            <tr>
                                <th scope="col"
                                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">ID</th>

                                <th scope="col"
                                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Clause
                                </th>
                                <th scope="col"
                                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">PARENT ID
                                </th>
                                <th scope="col"
                                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                    Parent 1</th>
                                <th scope="col"
                                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                    Parent 2</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                            <tr v-for="(item, index) in treeData" :key="index">
                                <td
                                    class="px-6 py-4 whitespace-nowrap text-center font-medium text-gray-800 dark:text-gray-200">
                                    {{ item.index }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-center text-gray-800 dark:text-gray-200">{{
        convertObjectIntoString(item) }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-center text-gray-800 dark:text-gray-200">{{
        parentsArrayToString(item.parents) }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-center text-gray-800 dark:text-gray-200">{{
        getAddressOfParents(item)[0] }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-center text-gray-800 dark:text-gray-200">{{
                                    getAddressOfParents(item)[1] }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import replacementArray from './../assets/data/latexReplacments.json';

export default {
    props: ['treeData'],
    data() {
        return {
            buttonLabel: { value: "Copy table as LaTeX", isDefault: true },
            isclipboardClicked: false
        };
    }, methods: {
        parentsArrayToString(array) {
            return array.join(', ');
        },

        clipboardInputLatex() {


            if (navigator.clipboard && this.buttonLabel.isDefault) {
                this.buttonLabel.value = "Successfully copied";
                this.buttonLabel.isDefault = false;
                this.clipboardLatex(this.exportTableToLatex());
                setTimeout(() => {
                    this.buttonLabel.value = "Copy table as LaTeX";
                    this.buttonLabel.isDefault = true;
                }, 1500);
            }
            return
        },

        exportTableToLatex() {
            let latex = "\\begin{table}[htbp]\n";
            latex += "\\centering\n";
            latex += "\\begin{tabular}{|c|c|c|c|c|}\n";
            latex += "\\hline\n";
            latex += "ID & Clause & Parent ID & Parent 1 & Parent 2 \\\\ \\hline\n";

            this.treeData.forEach(item => {
                latex += `${item.index} & \$${this.convertObjectIntoString(item)}\$ & ${this.parentsArrayToString(item.parents)} & \$${this.getAddressOfParents(item)[0]}\$ & \$${this.getAddressOfParents(item)[1]}\$ \\\\\n`;
            });

            latex += "\\hline\n";
            latex += "\\end{tabular}\n";
            latex += "\\caption{Your Table Caption}\n";
            latex += "\\label{tab:mytable}\n";
            latex += "\\end{table}";

            console.log(latex);
            return latex;
        },

        clipboardLatex(text) {
            let result = text;
            replacementArray.forEach(item => {
                result = result.split(item.text).join(item.value);
            });
            navigator.clipboard.writeText(result)
        },

        copyToClipboard(text) {
            if (navigator.clipboard && text.length > 0 && !this.isclipboardClicked) {
                navigator.clipboard.writeText(text)
                this.isclipboardClicked = true;
                setTimeout(() => {
                    this.isclipboardClicked = false;
                }, 1000);
            }
            return
        },

        getAddressOfParents(obj) {
            const firstParent = this.treeData.find(item => obj.parents[0] === item.index);
            const secondParent = this.treeData.find(item => obj.parents[1] === item.index);

            const firstParentAddress = firstParent ? this.convertObjectIntoString(firstParent) : '';
            const secondParentAddress = secondParent ? this.convertObjectIntoString(secondParent) : '';

            return [firstParentAddress, secondParentAddress];

        },

        convertObjectIntoString(element) {
            let cnfString = "";
            if (element.variables.length == 1) {
                cnfString += element.variables[0].isNeg
                    ? `¬${element.variables[0].variable}`
                    : element.variables[0].variable;
            } else {
                cnfString += "(";
                element.variables.forEach((element1) => {
                    cnfString += element1.isNeg
                        ? `¬${element1.variable}`
                        : element1.variable;
                    cnfString += "∨";
                });
                cnfString = cnfString.slice(0, -1);
                cnfString += ")";
            }
            return cnfString;
        }
    }
};
</script>

<style scoped>
@tailwind base;
@tailwind components;
@tailwind utilities;

.copy-button{
    width: 90%;
    margin-left: 5%;
}
</style>