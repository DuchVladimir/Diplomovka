<template>
    <div class="chart">
        <JSCharting :options="chartOptions" @rendered=callback() class="columnChart flex-1">
        </JSCharting>
        <!-- <div id="chartDiv" style="max-width: 500px; height:300px;">
                <button v-on:click="updateData">Update Data</button>
            </div> -->
    </div>
</template>

<script>
import Panzoom from '@panzoom/panzoom';
import JSCharting from 'jscharting-vue';
export default {
    props: ['treeData'],
    data() {
        return {
            indexMap: new Map(),
            chart: null,
            chartOptions: {
                type: 'organizational down',
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
                            // tooltip: '<b>%name</b><br/>%pos<br/>%phone'
                            tooltip: ''
                        },
                        points: [{
                            name: 'Afdsa fas',
                            id: 'a',
                            color: ''
                        },
                        {
                            name: 'Bfdsa ds',
                            id: 'b',
                            color: ''
                        },
                        {
                            name: 'C fds fd',
                            id: 'c',
                            parent: 'a,b'
                        }],

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
        },
        addData(dataArray) {
            dataArray.forEach(data => {
                this.chartOptions.series[0].points.push(data);
            });
        },
        clearTreeData() {
            this.chartOptions.series[0].points = [];
        },
        createPointsArrayFromData(data) {
            let newPoints = [];
            data.forEach(clause => {
                if (clause.isRoot) {
                    return;
                }
                let parent1 = createPointFromDataClause(data[clause.parents[0]]);
                let parent2 = createPointFromDataClause(data[clause.parents[1]]);
                let child = createPointFromDataClause(clause);

                parent1.id = parent1.id.toString() + 'a' + this.getNewIndex(parent1.id).toString();
                parent2.id = parent2.id.toString() + 'a' + this.getNewIndex(parent2.id).toString();
                child.parent = parent1.id + "," + parent2.id;
                child.hasChild = false;

                newPoints.push(parent1);
                newPoints.push(parent2);
                newPoints.push(child);
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
        }
    },
    watch: {
        treeData(newData) {
            this.clearTreeData();
            console.log("NEW DataTransfer, HURAYYY, ", newData);
            this.receivedValue = newData;
            this.addData(this.createPointsArrayFromData(newData))
            console.log(this.chartOptions);
        }
    }

    // mounted() {
    //     const elem = this.$refs.chart;
    //     const panzoom = Panzoom(elem, {
    //         maxScale: 5
    //     })
    //     panzoom.pan(10, 10)
    //     panzoom.zoom(2, { animate: true })
    //     elem.parentElement.addEventListener('wheel', panzoom.zoomWithWheel)
    // }
};
</script>

<style>
.columnChart {
    height: 100%;
}

#JSCharting_59267 {
    height: 100%;
}

.chart {
    min-height: 1000px;
}

@tailwind base;
@tailwind components;
@tailwind utilities;
</style>