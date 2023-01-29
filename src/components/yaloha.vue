
<template>
    <div>
        <Toast />

        <Button type="button" icon="pi pi-search" :label="selectedProduct ? selectedProduct.name : 'Select a Product'"
            @click="toggle" aria-haspopup="true" aria-controls="overlay_panel" />

        <OverlayPanel ref="op" appendTo="body" :showCloseIcon="true" id="overlay_panel" style="width: 450px"
            :breakpoints="{ '960px': '75vw' }">
            <DataTable :value="products" v-model:selection="selectedProduct" selectionMode="single" :paginator="true"
                :rows="5" @rowSelect="onProductSelect" responsiveLayout="scroll">
                <Column field="name" header="Name" sortable style="width: 50%"></Column>
                <Column header="Image" style="width: 20%">
                    <template #body="slotProps">
                        <img src="https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png"
                            :alt="slotProps.data.image" class="product-image" />
                    </template>
                </Column>
                <Column field="price" header="Price" sortable style="width: 30%">
                    <template #body="slotProps">
                        {{ formatCurrency(slotProps.data.price) }}
                    </template>
                </Column>
            </DataTable>
        </OverlayPanel>
    </div>
</template>

<script>
import ProductService from './service/ProductService';

export default {
    data() {
        return {
            products: null,
            selectedProduct: null
        }
    },
    productService: null,
    created() {
        this.productService = new ProductService();
    },
    mounted() {
        this.productService.getProductsSmall().then(data => this.products = data);
    },
    methods: {
        toggle(event) {
            this.$refs.op.toggle(event);
        },
        formatCurrency(value) {
            return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        },
        onProductSelect(event) {
            this.$refs.op.hide();
            this.$toast.add({ severity: 'info', summary: 'Product Selected', detail: event.data.name, life: 3000 });
        }
    }
}
</script>

<style lang="scss" scoped>
button {
    min-width: 15rem;
}

.product-image {
    width: 50px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)
}
</style>