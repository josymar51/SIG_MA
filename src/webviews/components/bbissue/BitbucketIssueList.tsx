import Button from '@atlaskit/button';
import TableTree from '@atlaskit/table-tree';
import Tooltip from '@atlaskit/tooltip';
import * as React from 'react';
import { BitbucketIssue } from '../../../bitbucket/model';
import { OpenBitbucketIssueAction } from '../../../ipc/bitbucketIssueActions';
import { StateRenderer } from './StatusMenu';

type ItemData = { issue: BitbucketIssue; postMessage: (e: OpenBitbucketIssueAction) => void };

const IssueKey = (data: ItemData) => (
    <div className="ac-flex-space-between">
        <Button
            appearance="subtle-link"
            onClick={() => data.postMessage({ action: 'openBitbucketIssue', issue: data.issue })}
        >
            #{data.issue.data.id}
        </Button>
    </div>
);
const Summary = (data: ItemData) => <p style={{ display: 'inline' }}>{data.issue.data.title}</p>;
const Priority = (data: ItemData) => (
    <Tooltip content={`priority: ${data.issue.data.priority}`}>
        <p>{data.issue.data.priority}</p>
    </Tooltip>
);
const StatusColumn = (data: ItemData) => <p style={{ display: 'inline' }}>{StateRenderer[data.issue.data.state!]}</p>;

export default class BitbucketIssueList extends React.Component<
    { issues: BitbucketIssue[]; postMessage: (e: OpenBitbucketIssueAction) => void },
    {}
> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <TableTree
                columns={[IssueKey, Summary, Priority, StatusColumn]}
                columnWidths={['100px', '100%', '60px', '150px']}
                items={this.props.issues.map((issue) => {
                    return {
                        id: issue.data.id,
                        content: {
                            issue: issue,
                            postMessage: this.props.postMessage,
                        },
                    };
                })}
            />
        );
    }
}
