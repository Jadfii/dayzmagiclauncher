<template>
	<div @focusout="close_delayed" class="relative">
		<Button @click.native="toggle" class="w-full">
			<div v-if="sort" class="flex-1 flex flex-row items-center justify-center">
				<span>{{ label }}: {{ getSelected() }}</span>
				<ion-icon :name="up ? 'chevron-up-sharp' : 'chevron-down-sharp'" class="ml-1"></ion-icon>
			</div>
		</Button>

		<div v-show="show" :class="{'origin-top-left left-0 mt-1': !up, 'left-0 top-auto bottom-100 mb-1': up}" class="absolute w-56 rounded z-50">
			<div class="rounded-md bg-sidebar">
				<div v-if="options" class="flex flex-col text-white">
					<div v-for="(option, index) in getOptions()" :key="index" @click="selectOption(option)" :class="{'opacity-50': !isSelectedOption(option), 'font-semibold': isSelectedOption(option), 'rounded-t': index == 0, 'rounded-b': index == options.length - 1}" class="cursor-pointer px-4 py-2 text-sm hover:opacity-100 hover:bg-black focus:outline-none transition-all duration-100">{{ getOptionLabel(option) }}</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default
{
	props: 
	{
		up:
		{
			type: Boolean,
			default: false
		},
		sort:
		{
			type: Boolean,
			default: true
		},
		none:
		{
			type: Boolean,
			default: false
		},
		label: String,
		options: 
		{
			type: Array,
			default: () => []
		},
		selected:
		{
			type: null,
			default: 0
		}
	},
	data()
	{
		return {
			show: false,
		}
	},
	computed:
	{
	},
	methods:
	{
		open()
		{
			this.show = true;
		},
		close()
		{
			this.show = false;
		},
		close_delayed()
		{
			setTimeout(() =>
			{
				this.close();
			}, 200);
		},
		toggle()
		{
			this.show = !this.show;
		},
		capitaliseString(string)
		{
			if (!string) return '';
  			return string.charAt(0).toUpperCase() + string.slice(1);
		},
		getOptions()
		{
			return [...this.options, ...(this.none ? ['Any'] : [])];
		},
		getSelected()
		{
			return this.getOptionLabel(this.options.find((option, i) =>
			{
				switch (typeof this.selected)
				{
					case 'number':
						return i == this.selected;
					case 'string':
						return option == this.selected;
					case 'object':
						return this.objectIsSelected(option, this.selected);
				
					default:
						return i == this.selected;
				}
			})) || 'Any';
		},
		getOptionLabel(option)
		{
			if (!option) return;

			let label;
			['name', 'label'].forEach((key) =>
			{
				if (option.hasOwnProperty(key))
				{
					label = option[key];
				}
			});

			if (!label) label = this.capitaliseString(option);

			return label;
		},
		selectOption(option)
		{
			this.$emit('select', option);
			this.close();
		},
		isSelectedOption(option)
		{
			return option == this.getSelected() || this.objectIsSelected(option, this.selected);
		},
		objectIsSelected(option, selected)
		{
			return option && selected && (option == selected || (option.label && selected.label && option.label == selected.label) || (option.name && selected.name && option.name == selected.name))
		}
	},
	created()
	{
	}
}
</script>