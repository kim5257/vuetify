// Styles
import '../../stylus/components/_expansion-panel.styl'

// Components
import { VExpansionPanelContent } from '.'

// Mixins
import Themeable from '../../mixins/themeable'
import { provide as RegistrableProvide } from '../../mixins/registrable'

// Utilities
import mixins from '../../util/mixins'
import { VNode } from 'vue'
import { PropValidator } from 'vue/types/options'

type VExpansionPanelContentInstance = InstanceType<typeof VExpansionPanelContent>

export default mixins(
  Themeable,
  RegistrableProvide('expansionPanel')
  /* @vue/component */
).extend({
  name: 'v-expansion-panel',

  provide (): object {
    return {
      expansionPanel: this
    }
  },

  props: {
    accordion: Boolean,
    disabled: Boolean,
    readonly: Boolean,
    multiple: Boolean,
    value: {
      type: [Number, Array],
      default: () => null
    } as any as PropValidator<number | number[]>
  },

  data: () => ({
    items: [] as VExpansionPanelContentInstance[],
    open: [] as boolean[]
  }),

  computed: {
    classes (): object {
      return {
        'v-expansion-panel--accordion': this.accordion,
        ...this.themeClasses
      }
    }
  },

  watch: {
    multiple (v: boolean) {
      let openIndex = -1
      if (!v) {
        // Close all panels unless only one is open
        const openCount = this.open.reduce((acc, val) => val ? acc + 1 : acc, 0)
        const open = Array(this.items.length).fill(false)

        if (openCount === 1) {
          openIndex = this.open.indexOf(true)
        }

        if (openIndex > -1) {
          open[openIndex] = true
        }

        this.open = open
      }

      this.$emit('input', v ? this.open : (openIndex > -1 ? openIndex : null))
    },
    value (v: number | number[]) {
      this.updateFromValue(v)
    }
  },

  mounted () {
    this.value !== null && this.updateFromValue(this.value)
  },

  methods: {
    updateFromValue (v: number | number[]) {
      if (Array.isArray(v) && !this.multiple) return

      let open = Array(this.items.length).fill(false)
      if (typeof v === 'number') {
        open[v] = true
      } else if (v !== null) {
        open = v
      }

      this.updatePanels(open)
    },
    updatePanels (open: boolean[]) {
      this.open = open
      for (let i = 0; i < this.items.length; i++) {
        this.items[i].toggle(open && open[i])
      }
    },
    panelClick (uid: number) {
      const open = this.multiple ? this.open.slice() : Array(this.items.length).fill(false)
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i]._uid === uid) {
          open[i] = !this.open[i]
          !this.multiple && this.$emit('input', open[i] ? i : null)
        }
      }

      this.updatePanels(open)
      if (this.multiple) this.$emit('input', open)
    },
    register (content: VExpansionPanelContentInstance) {
      const i = this.items.push(content) - 1
      this.value !== null && this.updateFromValue(this.value)
      content.toggle(this.open[i])
    },
    unregister (content: VExpansionPanelContentInstance) {
      const index = this.items.findIndex(i => i._uid === content._uid)
      this.items.splice(index, 1)
      this.open.splice(index, 1)
    }
  },

  render (h): VNode {
    return h('div', {
      staticClass: 'v-expansion-panel',
      class: this.classes
    }, this.$slots.default)
  }
})
