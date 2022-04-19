<template>
  <div>
    <el-breadcrumb>
      <el-breadcrumb-item :to="'/home'">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-alert type="info" center show-icon title="添加商品"></el-alert>
      </el-row>
      <el-steps :active="activeStep - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form
        :model="addForm"
        :rules="addFormRules"
        label-width="100px"
        label-position="top"
        ref="addFormRef"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeStep"
          :before-leave="beforTabChange"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item ref="goodsCatRef" label="商品分类" prop="goods_cat">
              <el-cascader
                :options="cateData"
                :props="cascaderProps"
                clearable
                show-all-levels
                v-model="goodsCat"
                @change="cateChange"
              >
              </el-cascader>
            </el-form-item>
            <el-form-item label="商品名称" prop="goods_name">
              <el-input type="text" v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="text" v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="text" v-model="addForm.goods_number"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane :disabled="!cateId" label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <el-checkbox-group
                v-model="item.selectAttrVals"
                @change="selectAttrChange"
              >
                <el-checkbox
                  border
                  :label="tag"
                  v-for="tag in item.attrVals"
                  :key="tag"
                >
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane :disabled="!cateId" label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-checkbox-group
                v-model="item.selectAttrVals"
                @change="selectAttrChange"
              >
                <el-checkbox
                  border
                  :label="tag"
                  v-for="tag in item.attrVals"
                  :key="tag"
                >
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane :disabled="!cateId" label="商品图片" name="3">
            <el-upload
              ref="uploadRef"
              class="upload-demo"
              :action="uploadUrl"
              :headers="uploadHeaders"
              :on-preview="handlePreview"
              :on-success="handleSuccess"
              :on-remove="handleRemove"
              list-type="picture"
            >
              <el-button size="small" type="primary">选择图片</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane :disabled="!cateId" label="商品内容" name="4">
            <quill-editor
              ref="quillEditorRef"
              v-model="addForm.goods_introduce"
            />
            <el-button type="primary" class="adButton" @click="submitData"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <el-dialog
      width="40%"
      title="预览图片"
      :visible.sync="previewDialogVisible"
      modal
      center
    >
      <img class="preview-img" :src="previewImgUrl" alt="" />
    </el-dialog>
  </div>
</template>

<script>
import { BASE_URL } from '@/config/config'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import { quillEditor } from 'vue-quill-editor'

export default {
  components: { quillEditor },
  data() {
    return {
      activeStep: '0',
      cateData: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: false,
        expandTrigger: 'hover'
      },
      goodsCat: [],
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: '',
        goods_number: '',
        goods_cat: '',
        pics: [],
        attrs: [],
        goods_introduce: ''
      },
      addFormRules: {
        goods_name: [
          { required: true, trigger: 'blur', message: '请输入商品名称' }
        ],
        goods_price: [
          { required: true, trigger: 'blur', message: '请输入商品价格' },
          { min: 0, trigger: 'blur', message: '商品价格不能小于0' }
        ],
        goods_weight: [
          { required: true, trigger: 'blur', message: '请输入商品重量' }
        ],
        goods_number: [
          { required: true, trigger: 'blur', message: '请输入商品数量' }
        ],
        goods_cat: [
          { required: true, trigger: 'blur', message: '请选择商品分类' }
        ]
      },
      manyTableData: [],
      onlyTableData: [],
      uploadUrl: `${BASE_URL}/upload`,
      uploadHeaders: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewDialogVisible: false,
      previewImgUrl: '',
      editorOption: []
    }
  },
  computed: {
    cateId: function () {
      if (this.goodsCat.length === 3) {
        return this.goodsCat[2]
      }
      return ''
    },
    attrs: function () {
      const params = this.onlyTableData.concat(this.manyTableData)
      const data = params.reduce((arr, item) => {
        if (item.selectAttrVals.length) {
          arr.push({
            attr_id: item.attr_id,
            attr_vals: item.selectAttrVals.join(',')
          })
        }
        return arr
      }, [])

      return data
    }
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get(`${BASE_URL}/categories`)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.cateData = res.data
      console.log('cateData', this.cateData)
    },
    async beforTabChange(activeName, oldActiveName) {
      const data = this.canActiveTabs(activeName)
      const p = new Promise((resolve, reject) => {
        if (data === activeName) {
          resolve(true)
        } else {
          reject(new Error())
        }
      })
      return p
    },
    cateChange(value) {
      this.goodsCat = value
      if (value.length !== 3) {
        this.goodsCat = []
        this.$refs.addFormRef.validateField('goods_cat')
      } else {
        this.addForm.goods_cat = value.join(',')
        this.$refs.goodsCatRef.clearValidate()
      }
      this.manyTableData = []
      this.onlyTableData = []
      this.addForm.attrs = []
      this.fileList = []
      this.getParamsData('many')
      this.getParamsData('only')
    },

    canActiveTabs(activeName) {
      const validateList = [
        'goods_name',
        'goods_price',
        'goods_weight',
        'goods_number',
        'goods_cat'
      ]
      if (!this.validateField(validateList)) {
        this.activeStep = '0'
        return '0'
      }
      switch (activeName) {
        case '1':
          if (!this.cateId) {
            this.activeStep = '0'
            return '0'
          }
          if (!this.onlyTableData.length) {
            this.getParamsData('only')
          }
          return '1'
        case '2':
          if (!this.cateId) {
            this.activeStep = '1'
            return '1'
          }
          if (!this.cateId) {
            this.activeStep = '1'
            return '1'
          }
          return '2'
        case '3':
          if (!this.cateId) {
            this.activeStep = '2'
            return '2'
          }
          return '3'
        case '4':
          return '4'
        default:
          return '0'
      }
    },
    validateField(validateList) {
      const attrValidate = []
      validateList.forEach((item) => {
        this.$refs.addFormRef.validateField(item, (errorMessage) => {
          if (errorMessage) {
            attrValidate.push(Promise.rejecte(null))
          } else {
            return false
          }
        })
      })
      if (!attrValidate.length) {
        return true
      }
      return false
    },
    async getParamsData(type) {
      if (!this.cateId) {
        return
      }
      const { data: res } = await this.$http.get(
        `${BASE_URL}/categories/${this.cateId}/attributes`,
        {
          params: { sel: type }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      res.data = res.data.map((item) => {
        item.attrVals = this.attrValList(item.attr_vals)
        item.selectAttrVals = item.attrVals
        return item
      })
      if (type === 'many') {
        this.manyTableData = res.data
        console.log('manyTableData', this.manyTableData)
      } else if (type === 'only') {
        this.onlyTableData = res.data
        console.log('onlyTableData', this.onlyTableData)
      }
      this.selectAttrChange()
    },

    attrValList(vals) {
      return vals ? vals.split(',') : []
    },
    selectAttrChange() {
      this.addForm.attrs = this.attrs
    },

    submitUpload() {
      this.$refs.uploadRef.submit()
    },

    handlePreview(file) {
      this.previewImgUrl = file.url
      this.previewDialogVisible = true
    },
    handleSuccess(response) {
      if (response.meta.status === 200) {
        const pic = {
          pic: response.data.tmp_path
        }
        this.addForm.pics.push(pic)
      }
    },
    handleRemove(file) {
      const {
        response: {
          data: { tmp_path: pic }
        }
      } = file
      const index = this.addForm.pics.findIndex((item) => item.pic === pic)
      if (index !== -1) {
        this.addForm.pics.splice(index, 1)
      }
    },
    async submitData() {
      console.log('addForm', this.addForm)
      const { data: res } = await this.$http.post(
        `${BASE_URL}/goods`,
        this.addForm
      )
      if (res.meta.status !== 201) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.$router.push('/goods')
    }
  },
  mounted() {
    this.getCateList()
  }
}
</script>

<style lang="less" scoped>
.el-row {
  margin-bottom: 10px;
}
.el-form {
  margin-top: 10px;
}

.preview-img {
  width: 100%;
}

.adButton {
  margin-top: 15px;
}
</style>
