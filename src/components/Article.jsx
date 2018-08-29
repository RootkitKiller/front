import React, { Component } from 'react';

import { Link } from 'react-router-dom';

import { Collapse } from 'antd';

import { List, Spin, Icon } from 'antd';

import { getTableRows, timeString } from '../request/request.js';

//const fakeDataUrl = 'https://randomuser.me/api/?results=5&inc=name,gender,email,nat&noinfo';

const Panel = Collapse.Panel;

const customPanelStyle = {
	background: '#f7f7f7',
	borderRadius: 4,
	marginBottom: 24,
	border: 0,
	overflow: 'hidden'
};

var listCates = [];
var listArticles = [];
var i = 0;
const antIcon = (
	<Icon
		type="loading"
		style={{
			fontSize: 50,
			textAlign: 'center',
			width: '300px',
			height: '350px',
			margin: 'auto',
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0
		}}
		spin
	/>
);

const IconText = ({ type, text }) => (
	<span>
		<Icon type={type} style={{ marginRight: 8, height: '20px' }} />
		{text}
	</span>
);

class Show extends Component {
	constructor(props) {
		super(props);
		this.state = {
			bool: false
		};
	}

	handleClick = event => {};
	handleOver = event => {
		this.setState({
			bool: true
		});
	};
	handleOut = event => {
		this.setState({
			bool: false
		});
	};
	render() {
		let showstyle = { marginRight: 8, height: '20px', width: '20px' };
		if (this.state.bool) {
			showstyle = {
				fontSize: 20,
				color: '#f50',
				marginRight: 8,
				height: '20px',
				width: '20px'
			};
		}
		return (
			<i
				className="anticon anticon-like"
				style={showstyle}
				onClick={this.handleClick.bind(this)}
				onMouseOver={this.handleOver.bind(this)}
				onMouseOut={this.handleOut.bind(this)}
			/>
		);
	}
}

class Article extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true
		};
	}
	componentDidMount() {
		// 数据异步请求，请求成功之后setState
		if (listCates.length === 0) {
			getTableRows({
				json: true,
				code: 'wafyartvotes',
				scope: 'wafyartvotes',
				table: 'cates'
			}).then(data => {
				try {
					listCates = data.rows;
					for (let i = 0; i < listCates.length; i++) {
						getTableRows({
							json: true,
							code: 'wafyartvotes',
							scope: listCates[i].catename,
							table: 'articles'
						}).then(data => {
							try {
								listArticles[i] = data.rows;
								//console.log(data.rows);
								this.setState({
									loading: false
								});
							} catch (e) {
								console.log(e);
							}
						});
					}
				} catch (e) {
					console.log(e);
				}
			});
		} else {
			this.setState({
				loading: false
			});
		}
	}
	render() {
		i = 0;
		return (
			<div>
				{this.state.loading ? (
					<Spin indicator={antIcon} />
				) : (
					<div>
						<Collapse bordered={false} defaultActiveKey={['1']} accordion>
							{listCates.map((iter, key) => {
								i = i + 1;
								return (
									<Panel
										header={iter.catename}
										key={i}
										style={customPanelStyle}
									>
										<List
											itemLayout="vertical"
											//loading = 'true'
											size="large"
											pagination={{
												onChange: page => {
													console.log(page);
												},
												pageSize: 5
											}}
											dataSource={listArticles[i - 1]}
											renderItem={item => (
												<List.Item
													key={item.id}
													actions={[
														<IconText type="user" text={item.author} />,
														<span>
															<Show id={String('zan' + item.id)} />
															{item.votenum}{' '}
														</span>,
														<IconText type="pay-circle" text={item.basetick} />,
														<IconText
															type="usr"
															text={timeString(item.timestamp)}
														/>
													]}
													extra={
														<img
															width={272}
															alt="logo"
															src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
														/>
													}
												>
													<List.Item.Meta
														//avatar={<Avatar src={item.a} />}
														//description = {'lost'}
														title={
															<Link
																to={{
																	pathname: String('/article/de' + item.id),
																	state: {
																		idata: item,
																		catename: listCates[key].catename
																	}
																}}
															>
																{new Buffer(item.title, 'base64').toString()}
															</Link>
														}
													/>
													<span
														style={{
															whiteSpace: 'normal',
															wordBreak: 'break-all'
														}}
													>
														{new Buffer(item.abstract, 'base64').toString()}
													</span>
												</List.Item>
											)}
										/>
									</Panel>
								);
							})}
						</Collapse>
					</div>
				)}
			</div>
		);
	}
}
export default Article;
