import * as React from 'react';

import * as _ from 'lodash';
import styled from '@emotion/styled';

import { DefaultNodeModel, PortModel } from '@projectstorm/react-diagrams';
import { CanvasWidget } from '@projectstorm/react-canvas-core';

import { TrayWidget } from './TrayWidget';
import { TrayItemWidget } from './TrayItemWidget';
import { DemoCanvasWidget } from './DemoCanvasWidget';

import { JSCustomNodeModel } from '../nodes/Custom/JSCustomNodeModel';
import { AdvancedPortModel } from '../ports/AdvancedPort/AdvancedPortModel';
import { ChatNodeModel } from '../nodes/Chat/ChatNodeModel';
import { ConditionalNodeModel } from '../nodes/Conditional/ConditionalNodeModel';
import { RequestNodeModel } from '../nodes/Request/RequestNodeModel';
import { SaveVariableNodeModel } from '../nodes/SaveVariable/SaveVariableNodeModel';
import { EndNodeModel } from '../nodes/End/EndNodeModel';

import { AccountTree, Chat, GetApp } from '@material-ui/icons/';
import { IoIosSave } from 'react-icons/io';
import { GiStopSign } from 'react-icons/gi';

export const Body = styled.div`
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	min-height: 100%;
`;

export const Header = styled.div`
	display: flex;
	background: rgb(30, 30, 30);
	flex-grow: 0;
	flex-shrink: 0;
	color: white;
	font-family: Helvetica, Arial, sans-serif;
	padding: 10px;
	align-items: center;
`;

export const Content = styled.div`
	display: flex;
	flex-grow: 1;
`;

export const Layer = styled.div`
	position: relative;
	flex-grow: 1;
`;

export class BodyWidget extends React.Component {
	render() {
		return (
			<Body>
				<Header>
					<div className="title">Brain It Solutions</div>
				</Header>
				<Content>
					<TrayWidget>
						{/* <TrayItemWidget model={{ type: 'in' }} name="In Node" color="rgb(192,255,0)" />
						<TrayItemWidget model={{ type: 'out' }} name="Out Node" color="rgb(0,192,255)" />
						<TrayItemWidget model={{ type: 'custom' }} name="Custom" color="rgb(255,0,0)" /> */}
						<TrayItemWidget
							model={{ type: 'chat' }}
							name="Chat"
							color="#25D366"
							icon={<Chat style={{ verticalAlign: "middle", marginRight: "5px", width: "24px", height: "24px" }}/>}
						/>
						<TrayItemWidget
							model={{ type: 'conditional' }} 
							name="Conditional" 
							color="#211F7E" 
							icon={<AccountTree style={{ verticalAlign: "middle", marginRight: "5px", width: "24px", height: "24px" }}/>} 
						/>
						<TrayItemWidget 
							model={{ type: 'request' }} 
							name="Request" 
							color="#BFBFBF" 
							icon={<GetApp style={{ verticalAlign: "middle", marginRight: "5px", width: "24px", height: "24px" }}/>} 
						/>
						<TrayItemWidget 
							model={{ type: 'save-variable' }}
							name="Save Variable"
							color="#A30000"
							icon={<IoIosSave style={{ verticalAlign: "middle", marginRight: "5px", width: "24px", height: "24px" }}/>}
						/>
						<TrayItemWidget 
							model={{ type: 'end' }}
							name="End"
							color="#98CEFF"
							icon={<GiStopSign style={{ verticalAlign: "middle", marginRight: "5px", width: "24px", height: "24px" }}/>}
						/>
					</TrayWidget>
					<Layer
						onDrop={(event) => {
							try {
								JSON.parse(event.dataTransfer.getData('storm-diagram-node'));
							} catch {
								return;
							}

							var data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));
							// var nodesCount = _.keys(this.props.app.getDiagramEngine().getModel().getNodes()).length;

							var node = null;
							if (data.type === 'chat') {
								node = new ChatNodeModel();
								node.addPort(new AdvancedPortModel(true, 'in'));
								node.addPort(new AdvancedPortModel(false, 'out'));
							} else if (data.type === 'conditional') {
								node = new ConditionalNodeModel();
								node.addPort(new AdvancedPortModel(true, 'in'));
								node.addPort(new AdvancedPortModel(false, 'out-c1'));
								node.addPort(new AdvancedPortModel(false, 'out-else'));
							} else if (data.type === 'request') {
								node = new RequestNodeModel();
								node.addPort(new AdvancedPortModel(true, 'in'));
								node.addPort(new AdvancedPortModel(true, 'out-2xx'));
								node.addPort(new AdvancedPortModel(true, 'out-err'));
							} else if (data.type === 'save-variable') {
								node = new SaveVariableNodeModel();
								node.addPort(new AdvancedPortModel(true, 'in'));
								node.addPort(new AdvancedPortModel(false, 'out'));
							} else if (data.type === "end") {
								node = new EndNodeModel();
								node.addPort(new AdvancedPortModel(true, 'in'));
							}

							var point = this.props.app.getDiagramEngine().getRelativeMousePoint(event);
							node.setPosition(point);
							this.props.app.getDiagramEngine().getModel().addNode(node);
							this.forceUpdate();
						}}
						onDragOver={(event) => {
							event.preventDefault();
						}}
					>
						<DemoCanvasWidget>
							<CanvasWidget engine={this.props.app.getDiagramEngine()} />
						</DemoCanvasWidget>
					</Layer>
				</Content>
			</Body>
		);
	}
}