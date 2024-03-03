<template>
    <div>
        <div class="mb-4 w-full" v-if="chart && showTree">
            <div class="w-full items-center justify-center mx-auto text-center">
                <h4 class="text-center mt-4">{{ value }} out of {{ maxSliderValue }} clauses</h4>
            </div>
            <div class="p-inputgroup w-full items-center justify-center mx-auto text-lg font-bold">
                <PrimeButton label="<<" class="p-button-outlined p-button-raised "
                    @click="() => { spinnerValue = 0 }" />
                <PrimeButton label="<" class="p-button-outlined p-button-raised" @click="removeLastClause" />
                <div class="slider-div">
                    <Slider v-model="spinnerValue" :step="1" :max="maxSliderValue" class="slider w-14rem w-full" />
                </div>
                <PrimeButton label=">" class="p-button-outlined p-button-raised " @click="addLastClause" />
                <PrimeButton label=">>" class="p-button-outlined p-button-raised "
                    @click="() => { spinnerValue = maxSliderValue }" />
            </div>
        </div>
        <div class="chart">
            <JSCharting v-if="chartOptions.series[0].points.length != 0" :mutable=false :options="chartOptions"
                @rendered="callback" class="columnChart flex-1">
            </JSCharting>
        </div>
    </div>
</template>


<script>
import Panzoom from '@panzoom/panzoom';
import debounce from 'lodash'
import JSCharting from 'jscharting-vue';
export default {
    props: ['treeData', 'showTree'],
    data() {
        return {
            spinnerValue: 0,
            value: 0,
            allPoints: [],
            oldTreeHeight: 0,
            maxSliderValue: 0,
            btnSelector: false,
            indexMap: new Map(),
            chart: null,
            chartOptions: {
                type: 'organizational right',
                legend_visible: false,
                debug: false,
                series: [
                    {
                        defaultPoint: {
                            label: {
                                text: '<b>%name</b>',
                                autoWrap: false
                            },
                            connectorLine_color: '#747c72',
                            connectorLine_width: 2,
                            annotation: {
                                padding: 9,
                                corners: ['cut', 'square', 'cut', 'square'],
                                margin: [15, 5, 10, 0],
                                outline: {
                                    width: 2,
                                }

                            },
                            color: 'rgba(250, 255, 253, 0.83)',
                            tooltip: ''
                        },
                        points: [],
                    }
                ],
            }
        };
    },
    components: {
        JSCharting
    },
    methods: {
        callback(chart) {
            this.chart = chart;
            this.setCorrectHeight();
        },
        addData(dataArray) {
            if (dataArray.length == 0) { return };
            dataArray[dataArray.length - 1].color = 'rgb(247, 204, 196)';
            let lastElement = this.chartOptions.series[0].points[this.chartOptions.series[0].points.length - 1]
            if (lastElement != undefined) {
                lastElement.color = lastElement.isRoot ? 'rgb(224, 227, 231)' : 'rgb(247, 246, 196)';
            }
            dataArray.forEach(data => {
                resetLastElementColor(this.allPoints);
                resetLastElementColor(this.chartOptions.series[0].points);
                this.allPoints.push(data);
                this.chartOptions.series[0].points.push(JSON.parse(JSON.stringify(data)));
            });

            this.value = this.maxSliderValue;
            this.btnSelector = true;
            this.spinnerValue = this.maxSliderValue;

            if (!this.showTree) {this.chartOptions.series[0].points = [];}

            function resetLastElementColor(dataArray) {
                let dataLenght = dataArray.length;
                if (dataLenght > 0) {
                    let lastElement = dataArray[dataLenght - 1];
                    lastElement.color = lastElement.isRoot ? 'rgb(224, 227, 231)' : 'rgb(247, 246, 196)';
                }
            }
        },
        setData() {
            this.chartOptions.series[0].points = [];
            if (this.value == 0 || !this.showTree) { return; }
            let treeArray = this.chartOptions.series[0].points;
            let count = 0;

            for (let i = 0; i < this.allPoints.length; i++) {
                if (hasParent(this.allPoints[i].parent) && !isPresentInTree(this.allPoints[i].id)) {
                    treeArray.push(JSON.parse(JSON.stringify(this.allPoints[i])));
                    count++;
                    if (count == this.value) {
                        console.log(this.value, "==", count)
                        break;
                    }
                } else {
                    treeArray.push(JSON.parse(JSON.stringify(this.allPoints[i])));
                }
            }
            treeArray[treeArray.length - 1].color = 'rgb(247, 204, 196)';

            this.setCorrectHeight();

            function hasParent(parent) {
                return !(parent === undefined || parent === null || parent.trim() === '');
            }

            function isPresentInTree(id) {
                return (treeArray.find(obj => obj.id === id) != undefined)
            }
        },

        removeLastClause() {
            if (this.value == 0) { return }
            this.value--;
            this.spinnerValue--;
            this.btnSelector = true;
            this.setData();
        },

        addLastClause() {
            let treeArray = this.chartOptions.series[0].points;
            if (treeArray.length == this.allPoints.length) { return }

            this.value++;
            this.spinnerValue++;
            this.btnSelector = true;

            if (treeArray.length > 0) {
                treeArray[treeArray.length - 1].color = treeArray[treeArray.length - 1].isRoot ? 'rgb(224, 227, 231)' : 'rgb(247, 246, 196)';
            }
            for (let i = treeArray.length; i < this.allPoints.length; i++) {
                treeArray.push(JSON.parse(JSON.stringify(this.allPoints[i])));
                if (hasParent(this.allPoints[i + 1].parent) && !isPresentInTree(this.allPoints[i + 1].id)) {
                    treeArray.push(JSON.parse(JSON.stringify(this.allPoints[i + 1])));
                    treeArray[treeArray.length - 1].color = 'rgb(247, 204, 196)';
                    break;
                }
            }

            this.setCorrectHeight();

            function hasParent(parent) {
                return !(parent === undefined || parent === null || parent.trim() === '');
            }

            function isPresentInTree(id) {
                return (treeArray.find(obj => obj.id === id) != undefined)
            }
        },

        clearTreeData() {
            this.maxSliderValue = 0;
            this.allPoints = [];
            this.chartOptions.series[0].points = [];
            this.btnSelector = true;
            this.spinnerValue = 0;
        },

        setCorrectHeight() {
            return new Promise((resolve, reject) => {
                const checkHeight = () => {
                    setTimeout(() => {
                        console.log("start");
                        const columnChartElement = document.querySelector('.columnChart');
                        if (columnChartElement) {
                            const svgElement = columnChartElement.querySelector('svg');
                            const gElements = svgElement.querySelectorAll('g');
                            if (gElements[28]) {
                                const gHeight = gElements[28].getBoundingClientRect().height;
                                if (gHeight !== this.oldTreeHeight) {
                                    columnChartElement.style.height = gHeight + 50 + 'px';
                                    resolve();
                                } else {
                                    checkHeight();
                                }
                            } else {
                                resolve();
                            }
                        } else {
                            resolve();
                        }
                    }, 50);
                };

                checkHeight();
            });
        },

        isParentWithoutChild(newPoints, parent) {
            let id = "";
            this.chartOptions.series[0].points.forEach(clause => {
                if (parseInt(parent.id.split("|")[0]) == parseInt(clause.id.split("|")[0])) {
                    if (!clause.hasChild) {
                        id = clause.id;
                        clause.hasChild = true;
                    }
                }
            });

            newPoints.forEach(clause => {
                if (parseInt(parent.id.split("|")[0]) == parseInt(clause.id.split("|")[0])) {
                    if (!clause.hasChild) {
                        id = clause.id;
                        clause.hasChild = true;
                    }
                }
            });

            if (id != "") {
                parent.id = id;
                return true;
            }
            newPoints.push(parent);
            return false;
        },

        //¬((((¬E ⇒ ¬C) ∨ (G ∨ C)) ⇔ (¬(E ∨ ¬C) ⇔ ¬(E ⇔ A))) ∧ (((B ∧ G) ∨ ¬(¬E ∨ G)) ⇔ (¬(¬A ∨ E) ⇔ (D ∨ D))))
        //A∧B∧(¬A∨¬B)
        //¬(¬(((G ∧ ¬C) ∨ ¬(¬B ∧ D)) ⇔ ¬(¬(¬E ∧ G) ⇔ (¬G ∨ E))) ∨ (¬(¬(¬B ⇔ C) ⇔ (A ∧ ¬A)) ⇒ ((¬E ⇒ ¬C) ∨ ¬(¬A ⇒ ¬C))))
        createPointsArrayFromData(data) {
            let newPoints = [];
            data.forEach(clause => {
                if (clause.isRoot) {
                    return;
                }
                let parent1 = createPointFromDataClause(data[clause.parents[0]]);
                let parent2 = createPointFromDataClause(data[clause.parents[1]]);
                let child = createPointFromDataClause(clause);

                parent1.id = parent1.id.toString() + '|' + this.getNewIndex(parent1.id).toString();
                parent2.id = parent2.id.toString() + '|' + this.getNewIndex(parent2.id).toString();
                this.isParentWithoutChild(newPoints, parent2);
                this.isParentWithoutChild(newPoints, parent1);

                child.parent = parent1.id + "," + parent2.id;
                child.id = child.id.toString() + '|' + this.getNewIndex(child.id).toString();
                child.hasChild = false;

                newPoints.push(child);
                this.maxSliderValue++;
            });
            return newPoints;

            function createPointFromDataClause(clause) {
                let parent = '';
                if (clause.parents.length > 0) {
                    parent = clause.parents[0] + ',' + clause.parents[1];
                }
                return {
                    name: convertObjectIntoString(clause),
                    id: clause.index.toString(),
                    hasChild: true,
                    isRoot: clause.isRoot,
                    color: clause.isRoot ? 'rgb(224, 227, 231)' : 'rgb(247, 246, 196)',
                }

                function convertObjectIntoString(element) {
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
        },
        getNewIndex(key) {
            if (this.indexMap.has(key)) {
                this.indexMap.set(key, this.indexMap.get(key) + 1);
            } else {
                this.indexMap.set(key, 1);
            }
            return this.indexMap.get(key) - 1;
        },
    },
    watch: {
        treeData(newData) {
            this.clearTreeData();
            console.log("NEW DataTransfer, HURAYYY, ", newData);
            this.receivedValue = newData;
            this.addData(this.createPointsArrayFromData(newData))
            console.log(this.chartOptions);
        },
        spinnerValue(newData) {
            clearTimeout(this.timeoutId);
            this.timeoutId = setTimeout(() => {
                if (!this.btnSelector) {
                    this.value = this.spinnerValue;
                    this.setData();
                }
                this.btnSelector = false;
            }, 500);
        },
        showTree(newData) {
            if (this.showTree) {
                this.setData()
            } else {
                this.chartOptions.series[0].points = [];
            }
        }
    }
};
</script>

<style>
.slider-div {
    border: 1px solid #2196F3;
    width: 40%;
    margin: 0 10px;
    padding: 0 0px;
}

.slider {
    padding: 21px;
    background-color: white;
}

.p-slider .p-slider-handle {
    height: 3rem;
    width: 1.2rem;
    background: #ffffff;
    border: 2px solid #2196F3;
    border-radius: 10px;
    transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);

}

.p-slider.p-slider-horizontal .p-slider-handle {
    margin-top: -1.5rem;
    margin-left: -0.6rem;
}

.p-slider:not(.p-disabled) .p-slider-handle:hover {
    background: #2196F3;
    border: 2px solid rgb(33, 150, 243);
}

.p-slider .p-slider-range {
    box-shadow: inset 1px 2px 8px rgba(0, 0, 0, 0.25);
    background: #b5deff;
}

.columnChart {
    height: 100%;
    width: 100%;
}

#JSCharting_59267 {
    height: 100%;
}

@tailwind base;
@tailwind components;
@tailwind utilities;
</style>