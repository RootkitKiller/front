import React, { Component } from 'react';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import draftToHtml from 'draftjs-to-html';
//import htmlToDraft from 'html-to-draftjs';
import { add } from '../tools/ipfsapi';
import { Input, Select, Button, Slider, InputNumber, Row, Col } from 'antd';
import { signfun } from '../request/request.js';

const { TextArea } = Input;
const Option = Select.Option;

class ControlledEditor extends Component {
	constructor(props) {
		super(props);
		this.state = {
			editorState: EditorState.createEmpty(),
			loading: false,
			titleContent: '',
			abstContent: '',
			styleContent: 'other',
			inputValue: 10
		};
		this.editstyle = {
			height: '300px',
			border: '2px solid #F1F1F1'
		};
		this.handleTitChange = this.handleTitChange.bind(this);
		this.handleAbsChange = this.handleAbsChange.bind(this);
		this.handleSelectChange = this.handleSelectChange.bind(this);
	}

	onEditorStateChange = editorState => {
		this.setState({
			editorState
		});
	};
	handleTitChange(event) {
		this.setState({ titleContent: event.target.value });
	}
	handleAbsChange(event) {
		this.setState({ abstContent: event.target.value });
	}
	onSliderChange = value => {
		this.setState({
			inputValue: value
		});
	};
	uploadCallBack(file) {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.open('POST', 'http://119.28.52.50:5001/api/v0/add', true);
			//xhr.setRequestHeader('Authorization',`PCTOKEN ${Cookie.get('PCTOKEN')}`);
			const data = new FormData();
			data.append('file', file);
			xhr.send(data);
			xhr.addEventListener('load', () => {
				const response = JSON.parse(xhr.responseText);
				let formdata = {
					data: {
						link: 'http://119.28.52.50:8080/ipfs/' + response.Hash
					}
				};
				console.log(response);
				resolve(formdata);
			});
			xhr.addEventListener('error', () => {
				const error = JSON.parse(xhr.responseText);
				reject(error);
			});
		});
	}

	enterLoading = () => {
		this.setState({ loading: true });
		//获取标题、摘要、正文内容
		const titbuf = Buffer.from(this.state.titleContent);
		const titBase = titbuf.toString('base64');
		const titdeBase = new Buffer(titBase, 'base64');
		console.log(titdeBase.toString());

		const absbuf = Buffer.from(this.state.abstContent);
		const absBase = absbuf.toString('base64');
		const absdeBase = new Buffer(absBase, 'base64');
		console.log(absdeBase.toString());

		const htmlCon = draftToHtml(
			convertToRaw(this.state.editorState.getCurrentContent())
		);
		const htmbuf = Buffer.from(htmlCon);
		const htmBase = htmbuf.toString('base64');
		const htmdeBase = new Buffer(htmBase, 'base64');
		console.log(htmdeBase.toString());

		console.log(this.state.styleContent);
		console.log(this.state.inputValue);

		//上传文章内容到ipfs网络
		const buffer = Buffer.from(htmBase);
		add(buffer)
			.then(hash => {
				console.log(hash);
				//上传文章到区块链
				signfun(
					'wafyartvotes',
					'createart',
					'self',
					titBase,
					absBase,
					hash,
					'devtest',
					this.state.inputValue * 10000
				);
				this.setState({ loading: false });
				alert('success');
			})
			.catch(err => {
				console.log(err);
			});
	};

	handleSelectChange(value) {
		this.setState({ styleContent: value });
	}
	render() {
		const { editorState } = this.state;
		const { inputValue } = this.state;
		return (
			<div>
				<h3>标题（不超过30字）</h3>
				<TextArea
					value={this.state.titleContent}
					onChange={this.handleTitChange}
					autosize
				/>
				<div style={{ margin: '15px 0' }} />
				<h3>摘要（不超过180字）</h3>
				<TextArea
					value={this.state.abstContent}
					onChange={this.handleAbsChange}
					autosize={{ minRows: 1, maxRows: 6 }}
				/>
				<div style={{ margin: '15px 0' }} />
				<h3>正文</h3>
				<Editor
					editorState={editorState}
					wrapperClassName="demo-wrapper"
					editorClassName="demo-editor"
					editorStyle={this.editstyle}
					onEditorStateChange={this.onEditorStateChange}
					toolbar={{
						options: [
							'inline',
							'blockType',
							'fontSize',
							'fontFamily',
							'list',
							'textAlign',
							'colorPicker',
							'image'
						],
						list: { inDropdown: true },
						textAlign: { inDropdown: true },
						link: { inDropdown: true },
						image: {
							urlEnabled: false,
							uploadEnabled: true,
							alignmentEnabled: false,
							uploadCallback: this.uploadCallBack,
							previewImage: true,
							inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
							alt: { present: false, mandatory: false },
							defaultSize: { height: '300' }
						}
					}}
				/>
				<div style={{ margin: '15px 0' }} />
				<h3>奖励</h3>
				<Select
					defaultValue="other"
					style={{ width: '100%' }}
					onChange={this.handleSelectChange}
				>
					<Option value="other">奖励他人（建议寻求帮助者选择）</Option>
					<Option value="self">奖励自己（建议提供帮助者选择）</Option>
				</Select>
				{/*
        <br />
        <h3>预览</h3>
        <br />
        <div dangerouslySetInnerHTML = {{ __html:draftToHtml(convertToRaw(editorState.getCurrentContent()))}}>
        {console.log(draftToHtml(convertToRaw(editorState.getCurrentContent())))}
        </div>
        */}
				<div style={{ margin: '15px 0' }} />
				<h3>支付MZP（默认为最低支付）</h3>
				<Row>
					<Col span={20}>
						<Slider
							min={10}
							max={1000}
							onChange={this.onSliderChange}
							value={inputValue}
						/>
					</Col>
					<Col span={4}>
						<div style={{ float: 'right' }}>
							<InputNumber
								min={10}
								max={1000}
								style={{ marginLeft: 16 }}
								disabled={true}
								value={inputValue}
								onChange={this.onSliderChange}
							/>
						</div>
					</Col>
				</Row>
				<div style={{ margin: '15px 0' }} />
				<div style={{ float: 'right' }}>
					<Button
						type="primary"
						loading={this.state.loading}
						onClick={this.enterLoading}
					>
						发布!
					</Button>
				</div>
				<br />
			</div>
		);
	}
}

export default ControlledEditor;
