import * as React from 'react';
import CheckCircleIcon from '@atlaskit/icon/glyph/check-circle';
import RecentIcon from '@atlaskit/icon/glyph/recent';
import ErrorIcon from '@atlaskit/icon/glyph/error';
import InlineDialog from '@atlaskit/inline-dialog';
import Tooltip from '@atlaskit/tooltip';
import { colors } from '@atlaskit/theme';
import Button from '@atlaskit/button';

const successIcon = <CheckCircleIcon primaryColor={colors.G400} label='build successful' />;
const inprogressIcon = <RecentIcon primaryColor={colors.B300} label='build in progress' />;
const errorIcon = <ErrorIcon primaryColor={colors.R400} label='build failure' />;

export default class BuildStatus extends React.Component<{ buildStatuses?: Bitbucket.Schema.Commitstatus[] }, { dialogOpen: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { dialogOpen: false };
    }

    toggleDialog = () => this.setState({ dialogOpen: !this.state.dialogOpen });
    closeDialog = () => this.setState({ dialogOpen: false });

    render() {
        if (!this.props.buildStatuses || this.props.buildStatuses.length === 0) {
            return null;
        }
        const buildString = this.props.buildStatuses.length === 1 ? 'build' : 'builds';
        const successes = this.props.buildStatuses.filter(status => status.state === 'SUCCESSFUL');
        const inprogress = this.props.buildStatuses.filter(status => status.state === 'INPROGRESS');

        const resultIcon = inprogress.length > 0
            ? <Tooltip content={`${inprogress.length} of ${this.props.buildStatuses.length} ${buildString} in progress`} position='top'>{inprogressIcon}</Tooltip>
            : (successes.length === this.props.buildStatuses.length)
                ? <Tooltip content={`${successes.length} of ${this.props.buildStatuses.length} ${buildString} passed`} position='top'>{successIcon}</Tooltip>
                : <Tooltip content={`${this.props.buildStatuses.length - successes.length} of ${this.props.buildStatuses.length} ${buildString} unsuccessful`} position='top'>{errorIcon}</Tooltip>;

        return <div className='ak-inline-dialog'>
            <InlineDialog
                content={this.props.buildStatuses.map(status =>
                    <Button
                        appearance='link'
                        href={status.url}
                        iconBefore={status.state === 'INPROGRESS'
                            ? inprogressIcon
                            : status.state === 'SUCCESSFUL'
                                ? successIcon
                                : errorIcon}
                    >
                        {status.name}
                    </Button>)}
                isOpen={this.state.dialogOpen}
                onClose={this.closeDialog}>
                <Button appearance='link' iconBefore={resultIcon} onClick={this.toggleDialog} />
            </InlineDialog>
        </div>;
    }
}