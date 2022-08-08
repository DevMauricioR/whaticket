import React, { useState, useCallback, useEffect, useReducer } from "react";

import { CheckCircle, DeleteOutline, Edit } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
	Button,
	TableBody,
	TableRow,
	TableCell,
	Table,
	TableHead,
	Paper,
	IconButton,
} from "@material-ui/core";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ConfirmationModal from "../../components/ConfirmationModal";

import OfficialWhatsAppModal from "../../components/OfficialWhatsAppModal";

import { useTranslation } from 'react-i18next'
import { format, parseISO } from "date-fns";
import api from "../../services/api";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
	mainPaper: {
		flex: 1,
		padding: theme.spacing(1),
		overflowY: "scroll",
		...theme.scrollbarStyles,
	},
	customTableCell: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	tooltip: {
		backgroundColor: "#f5f5f9",
		color: "rgba(0, 0, 0, 0.87)",
		fontSize: theme.typography.pxToRem(14),
		border: "1px solid #dadde9",
		maxWidth: 450,
	},
	tooltipPopper: {
		textAlign: "center",
	},
	buttonProgress: {
		color: green[500],
	},
}));

const OfficialConnections = () => {
	const classes = useStyles();
	const { i18n } = useTranslation();

	const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
	const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);
	const [loadWhats, setLoadWhats] = useState(true);
	const [whatsApps, setWhatsApps] = useState();

	const [loading, setLoading] = useState(true);

	const confirmationModalInitialState = {
		action: "",
		title: "",
		message: "",
		whatsAppId: "",
		open: false,
	};
	const [confirmModalInfo, setConfirmModalInfo] = useState(
		confirmationModalInitialState
	);

	useEffect(() => {
		setLoading(true);
		const fetchWhats = async () => {
			try {
				const { data } = await api.get(`/whatsapp/list/${true}`);
				setWhatsApps(data);
				setLoading(false);
			} catch (err) {
				setLoading(false);
				toastError(err);
			}
		};
		fetchWhats();
		setLoadWhats(false);
	}, [loadWhats]);

	const handleOpenWhatsAppModal = () => {
		setSelectedWhatsApp(null);
		setWhatsAppModalOpen(true);
		setLoadWhats(true);
	};

	const handleCloseWhatsAppModal = useCallback(() => {
		setWhatsAppModalOpen(false);
		setSelectedWhatsApp(null);
		setLoadWhats(true);
	}, [setWhatsAppModalOpen]);

	const handleEditWhatsApp = (whatsApp) => {
		setSelectedWhatsApp(whatsApp);
		setWhatsAppModalOpen(true);
		setLoadWhats(true);
	};

	const handleOpenConfirmationModal = (action, whatsAppId) => {
		if (action === "delete") {
			setConfirmModalInfo({
				action: action,
				title: i18n.t("connections.confirmationModal.deleteTitle"),
				message: i18n.t("connections.confirmationModal.deleteMessage"),
				whatsAppId: whatsAppId,
			});
		}
		setConfirmModalOpen(true);
		setLoadWhats(true);
	};

	const handleSubmitConfirmationModal = async () => {
		if (confirmModalInfo.action === "delete") {
			try {
				await api.delete(`/whatsapp/${confirmModalInfo.whatsAppId}`);
				toast.success(i18n.t("connections.toasts.deleted"));
			} catch (err) {
				toastError(err);
			}
		}

		setConfirmModalInfo(confirmationModalInitialState);
		setLoadWhats(true);
	};

	return (
		<MainContainer>
			<ConfirmationModal
				title={confirmModalInfo.title}
				open={confirmModalOpen}
				onClose={setConfirmModalOpen}
				onConfirm={handleSubmitConfirmationModal}
			>
				{confirmModalInfo.message}
			</ConfirmationModal>
			<OfficialWhatsAppModal
				open={whatsAppModalOpen}
				onClose={handleCloseWhatsAppModal}
				whatsAppId={selectedWhatsApp?.id}
			/>
			<MainHeader>
				<Title>{i18n.t('officialConnections.title')}</Title>
				<MainHeaderButtonsWrapper>
					<Button
						variant="contained"
						color="primary"
						onClick={handleOpenWhatsAppModal}
					>
						{i18n.t("connections.buttons.add")}
					</Button>
				</MainHeaderButtonsWrapper>
			</MainHeader>
			<Paper className={classes.mainPaper} variant="outlined">
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell align="center">
								{i18n.t("connections.table.name")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("connections.table.status")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("connections.table.session")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("connections.table.lastUpdate")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("connections.table.default")}
							</TableCell>
							<TableCell align="center">
								{i18n.t("connections.table.actions")}
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRowSkeleton />
						) : (
							<>
								{whatsApps?.length > 0 &&
									whatsApps.map(whatsApp => (
										<TableRow key={whatsApp.id}>
											<TableCell align="center">{whatsApp.name}</TableCell>
											<TableCell align="center">
												Status
											</TableCell>
											<TableCell align="center">
												Sessão
											</TableCell>
											<TableCell align="center">
												{format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm")}
											</TableCell>
											<TableCell align="center">
												{whatsApp.isDefault && (
													<div className={classes.customTableCell}>
														<CheckCircle style={{ color: green[500] }} />
													</div>
												)}
											</TableCell>
											<TableCell align="center">
												<IconButton
													size="small"
													onClick={() => handleEditWhatsApp(whatsApp)}
												>
													<Edit />
												</IconButton>

												<IconButton
													size="small"
													onClick={e => {
														handleOpenConfirmationModal("delete", whatsApp.id);
													}}
												>
													<DeleteOutline />
												</IconButton>
											</TableCell>
										</TableRow>
									))}
							</>
						)}
					</TableBody>
				</Table>
			</Paper>
		</MainContainer>
	);
};

export default OfficialConnections;
