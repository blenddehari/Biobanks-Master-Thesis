<template>
	<v-alert prominent flat dismissible :value="visible" :v-if="visible" v-model="visible" :type="type" class="notification" style="border-radius: 0; position: sticky;">
		<div class="title">{{ this.value }}</div>
		<div class="detail">
			<slot />
		</div>
	</v-alert>
</template>

<script>
// TODO: make this also capable to act as successAlert
// TODO: close button

export default {
	name: 'ErrorAlert',
	props: {
		type: { type: String, default: 'error' },
		value: { type: String },
	},
	data: () => ({
		visible: false,
	}),
	watch: {
		value(v) {
			this.visible = !!v
		},
		visible(v) {
			if (!v) return this.close()
			setTimeout(this.close, 5000)
		},
	},
	methods: {
		close() {
			this.visible = false
			this.$emit('input', null)
		},
	},
	mounted() {
		this.visible = !!this.value
	},
}
</script>

<style scoped>
.title { font-size: 14pt; font-weight: bold; }

</style>