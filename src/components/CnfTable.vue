<template>
    <div class="flex flex-col" v-if="treeData">
        <div class="-m-1.5 overflow-x-auto">
            <div class="p-1.5 min-w-full inline-block align-middle">
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
export default {
    props: ['treeData'],
    data() {
        return {
        };
    }, methods: {
        parentsArrayToString(array) {
                return array.join(', ');
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
</style>