<template>
    <!-- <div ref="chart"> -->
    <JSCharting :options="chartOptions" @rendered=callback() class="columnChart flex-1">
    </JSCharting>
    <!-- <div id="chartDiv" style="max-width: 500px; height:300px;">
                <button v-on:click="updateData">Update Data</button>
            </div> -->
    <!-- </div> -->
</template>

<script>
import Panzoom from '@panzoom/panzoom';
import JSCharting from 'jscharting-vue';
export default {
    data() {
        return {
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
                        points: [
                            {
                                name: 'Afdsa fas',
                                id: 'a',
                                color: '',
                                attributes: { pos: '', phone: '' }
                            },
                            {
                                name: 'Bfdsa ds',
                                id: 'b',
                                color: '',
                                attributes: { pos: '', phone: '' }
                            },
                            {
                                name: 'C fds fd',
                                id: 'c',
                                parent: 'a,b',
                                attributes: { pos: '', phone: '' }
                            },
                            {
                                name: 'Dhgfd cxz',
                                id: 'd',
                                parent: 'a1,c',
                                attributes: {
                                    pos: '',
                                    phone: ''
                                }
                            },
                            {
                                name: 'Egfdh tws',
                                id: 'e',
                                parent: 'd,f',
                                attributes: {
                                    pos: '',
                                    phone: ''
                                }
                            },
                            {
                                name: 'Fgcvds htse',
                                id: 'f',
                                attributes: {
                                    pos: '',
                                    phone: ''
                                }
                            },
                            {
                                name: 'Ggfds bgfvds',
                                id: 'g',
                                parent: 'a2,e',
                                attributes: {
                                    pos: '',
                                    phone: ''
                                }
                            },
                            {
                                name: 'Afdsb bfdsb sdfds',
                                id: 'a1',
                                color: 'red',
                                attributes: { pos: '', phone: '' }
                            },
                            {
                                name: 'Afsdg fsd',
                                id: 'a2',
                                color: 'red',
                                attributes: { pos: '', phone: '' }
                            },
                            {
                                name: 'Afsdg fsd',
                                id: 'n',
                                color: 'red',
                                parent: 'g',
                                attributes: { pos: '', phone: '' }
                            },
                            {
                                name: 'Afsdg fsd',
                                id: 'm',
                                color: 'red',
                                parent: 'n',
                                attributes: { pos: '', phone: '' }
                            }
                        ],

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
        updateData() {
            this.chart.connectors(["a2", "up"], { color: "red" });
        }
    },
    mounted() {
        // const elem = this.$refs.chart;
        // const panzoom = Panzoom(elem, {
        //     maxScale: 5
        // })
        // panzoom.pan(10, 10)
        // panzoom.zoom(1, { animate: true })
        // elem.parentElement.addEventListener('wheel', panzoom.zoomWithWheel)
    }
};
</script>

<style>
.columnChart {
    height: auto;
}

@tailwind base;
@tailwind components;
@tailwind utilities;
</style>