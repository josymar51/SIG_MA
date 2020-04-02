import { JiraIcon } from '@atlassianlabs/guipi-jira-components';
import {
    Avatar,
    Box,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Theme,
    Typography
} from '@material-ui/core';
import CloudIcon from '@material-ui/icons/Cloud';
import DeleteIcon from '@material-ui/icons/Delete';
import DomainIcon from '@material-ui/icons/Domain';
import EditIcon from '@material-ui/icons/Edit';
import makeStyles from '@material-ui/styles/makeStyles';
import clsx from 'clsx';
import React, { useContext } from 'react';
import { uid } from 'react-uid';
import { DetailedSiteInfo, Product } from '../../../../atlclients/authInfo';
import { SiteWithAuthInfo } from '../../../../lib/ipc/toUI/config';
import { ResourceContext } from '../../../resourceContext';
import { useBorderBoxStyles } from '../../common/useBorderBoxStyles';
import { ConfigControllerContext } from '../configController';

type SiteListProps = {
    product: Product;
    sites: SiteWithAuthInfo[];
    editServer: (site: SiteWithAuthInfo) => void;
};

const useStyles = makeStyles(
    (theme: Theme) =>
        ({
            root: {
                flexGrow: 1
            },
            iconStyle: {
                color: theme.palette.grey[600]
            }
        } as const)
);

function generateListItems(
    product: Product,
    sites: SiteWithAuthInfo[],
    logout: (site: DetailedSiteInfo) => void,
    edit: (site: SiteWithAuthInfo) => void,
    scheme: string,
    iconClassName: string
): JSX.Element[] {
    const fallbackImg = `${scheme}images/${product.key}-icon.svg`;

    if (sites.length < 1) {
        return [
            <ListItem key="empty">
                <Box width="100%">
                    <Typography align="center">No sites found.</Typography>
                </Box>
            </ListItem>
        ];
    }
    return sites.map((swa: SiteWithAuthInfo, i: number) => {
        const avatarUrl = swa.site.avatarUrl && swa.site.avatarUrl.length > 0 ? swa.site.avatarUrl : fallbackImg;

        return (
            <React.Fragment key={uid(swa, i)}>
                <ListItem key={swa.site.name}>
                    <ListItemIcon>
                        {swa.site.isCloud ? (
                            <CloudIcon fontSize="small" className={iconClassName} />
                        ) : (
                            <DomainIcon fontSize="small" className={iconClassName} />
                        )}
                    </ListItemIcon>
                    <ListItemAvatar>
                        <Avatar src={avatarUrl}>
                            <JiraIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={swa.site.name} />
                    <ListItemSecondaryAction>
                        {!swa.site.isCloud && (
                            <IconButton edge="end" aria-label="edit" onClick={() => edit(swa)}>
                                <EditIcon fontSize="small" color="inherit" />
                            </IconButton>
                        )}
                        <IconButton edge="end" aria-label="delete" onClick={() => logout(swa.site)}>
                            <DeleteIcon fontSize="small" color="inherit" />
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
                {sites.length !== i + 1 && <Divider />}
            </React.Fragment>
        );
    });
}

export const SiteList: React.FunctionComponent<SiteListProps> = ({ sites, product, editServer }) => {
    const scheme: string = useContext(ResourceContext);
    const controller = useContext(ConfigControllerContext);
    const borderBox = useBorderBoxStyles();

    const classes = useStyles();

    return (
        <div className={clsx(classes.root, borderBox.box)}>
            <List>{generateListItems(product, sites, controller.logout, editServer, scheme, classes.iconStyle)}</List>
        </div>
    );
};
