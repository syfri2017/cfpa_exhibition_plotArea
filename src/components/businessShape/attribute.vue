<template>
    <Modal
        title="展位信息"
        class="component-business-shape-attribute"
        v-model="visible"
        :closable="false"
        :mask-closable="false">
        <Form :model="formData" :label-width="80">
            <FormItem label="展位编号">
                <Input v-model="formData.code"></Input>
            </FormItem>
            <FormItem label="编号式样">
                <Row>
                    <Col span="12">
                        <Select
                            v-model="formData.codeFontFamily">
                            <Option
                                v-for="item in baseFontOptions.fontFamily"
                                :value="item.value"
                                :key="item.value"
                            >{{item.name}}</Option>
                        </Select>
                    </Col>
                    <Col span="5" style="margin: 0 10px">
                        <Select
                            v-model="formData.codeFontSize">
                            <Option
                                v-for="item in baseFontOptions.fontSize"
                                :value="item"
                                :key="item"
                            >{{item}}px</Option>
                        </Select>
                    </Col>
                    <Col span="5">
                        <Select
                            v-model="formData.codeFontStyle">
                            <Option
                                v-for="item in baseFontOptions.fontStyle"
                                :value="item.value"
                                :key="item.value"
                            >{{item.name}}</Option>
                        </Select>
                    </Col>
                </Row>
            </FormItem>
            <FormItem label="展位名称">
                <Input v-model="formData.name"></Input>
            </FormItem>
            <FormItem label="名称式样">
                <Row>
                    <Col span="12">
                        <Select
                            v-model="formData.nameFontFamily">
                            <Option
                                v-for="item in baseFontOptions.fontFamily"
                                :value="item.value"
                                :key="item.value"
                            >{{item.name}}</Option>
                        </Select>
                    </Col>
                    <Col span="5" style="margin: 0 10px">
                        <Select
                            v-model="formData.nameFontSize">
                            <Option
                                v-for="item in baseFontOptions.fontSize"
                                :value="item"
                                :key="item"
                            >{{item}}px</Option>
                        </Select>
                    </Col>
                    <Col span="5">
                        <Select
                            v-model="formData.nameFontStyle">
                            <Option
                                v-for="item in baseFontOptions.fontStyle"
                                :value="item.value"
                                :key="item.value"
                            >{{item.name}}</Option>
                        </Select>
                    </Col>
                </Row>
            </FormItem>
            <FormItem label="展位类型">
                <Row>
                    <Col span="9">
                        <Select v-model="formData.boothType">
                            <Option value="标准展位">标准展位</Option>
                            <Option value="室外光地展位">室外光地展位</Option>
                        </Select>
                    </Col>
                    <Col span="6" style="text-align:right;padding-right:10px">
                        出口类型
                    </Col>
                    <Col span="9">
                        <Select v-model="formData.entryType">
                            <Option value="一面开">一面开</Option>
                            <Option value="两面开">两面开</Option>
                            <Option value="三面开">三面开</Option>
                            <Option value="全开">全开</Option>
                        </Select>
                    </Col>
                </Row>
            </FormItem>
            <FormItem label="横向长度">
                <Row>
                    <Col span="9">
                        <InputNumber
                            :min="0"
                            v-model="formData.lateralLength"
                            :formatter="value => `${value} 米`"
                            :parser="value => value.replace(' 米', '')">
                        </InputNumber>
                    </Col>
                    <Col span="6" style="text-align:right;padding-right:10px">
                        纵向长度
                    </Col>
                    <Col span="9">
                        <InputNumber
                            :min="0"
                            v-model="formData.verticalLength"
                            :formatter="value => `${value} 米`"
                            :parser="value => value.replace(' 米', '')">
                        </InputNumber>
                    </Col>
                </Row>
            </FormItem>
            <FormItem label="展位面积">
                <InputNumber
                    :min="0"
                    v-model="formData.area"
                    :formatter="value => `${value} 平方米`"
                    :parser="value => value.replace(' 平方米', '')">
                </InputNumber>
            </FormItem>
            <FormItem label="展位状态">
                <Select
                    v-model="formData.status">
                    <Option
                        v-for="item in dataStatus"
                        :value="item.value"
                        :key="item.value"
                    >{{item.name}}</Option>
                </Select>
            </FormItem>
        </Form>
        <div slot="footer">
            <Button @click="$emit('close')">取消</Button>
            <Button @click="saveData">确定</Button>
        </div>
    </Modal>
</template>

<script>
import fontOptions from '@/store/static/plot/AppPlotBaseFontOptions'
import emptyData from './emptyData.json'
export default {
    props: {
        show: {
            type: Boolean,
            default: false
        },
        data: {
            type: Object
        }
    },
    data () {
        return {
            visible: this.show,
            formData: emptyData,
            baseFontOptions: fontOptions,
            dataStatus: [{
                name: '新建展位',
                value: 'normal'
            }, {
                name: '已分配展位',
                value: 'allotted'
            }, {
                name: '已预定展位',
                value: 'bespoke'
            }, {
                name: '已确定展位',
                value: 'completed'
            }]
        }
    },
    computed: {},
    watch: {
        show (newValue, oldValue) {
            this.visible = newValue
        },
        data (newValue, oldValue) {
            this.formData = newValue
        },
        'formData.lateralLength': 'calcArea',
        'formData.verticalLength': 'calcArea'
    },
    methods: {
        handlerCancel () {
            this.formData = emptyData
            this.$emit('close')
        },
        saveData () {
            this.$store.dispatch('updateBusinessRecord', this.formData)
            this.$emit('close')
        },
        calcArea () {
            this.formData.area = this.formData.lateralLength * this.formData.verticalLength.toFixed(2)
        }
    }
}
</script>

<style lang="scss" scoped>
.component-business-shape-attribute {
    .ivu-input-number {
        display: block;
        width: auto;
    }
}
</style>

