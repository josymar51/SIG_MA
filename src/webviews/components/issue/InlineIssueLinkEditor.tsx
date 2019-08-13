import * as React from 'react';
import Select, { AsyncSelect, components } from '@atlaskit/select';
import Spinner from '@atlaskit/spinner';
import { IssueLinkTypeSelectOption } from '../../../jira/jira-client/model/fieldUI';
import { IssuePickerIssue } from '../../../jira/jira-client/model/responses';

export type LinkTypeAndIssue = {
    issueKey: string;
    type: IssueLinkTypeSelectOption;
};

type Props = {
    linkTypes: IssueLinkTypeSelectOption[];
    label: string;
    onSave: (val: LinkTypeAndIssue) => void;
    onFetchIssues: (input: string) => Promise<IssuePickerIssue[]>;
    isLoading: boolean;
};

interface State {
    linkTypes: IssueLinkTypeSelectOption[];
    label: string;
    isEditing: boolean;
    isLoading: boolean;
    isIssueLoading: boolean;
    selectedLinkType: IssueLinkTypeSelectOption | undefined;
    selectedIssue: IssuePickerIssue | undefined;
    editorContainerClassname: string | undefined;
    defaultIssueValue: IssuePickerIssue | undefined;
}

const { Option } = components;
const TypeOption = (props: any) => (
    <Option {...props}>
        <div ref={props.innerRef} {...props.innerProps} style={{ display: 'flex', 'align-items': 'center' }}><span style={{ marginLeft: '10px' }}>{props.label}</span></div>
    </Option>
);

const TypeValue = (props: any) => (
    <components.SingleValue {...props}>
        <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ marginLeft: '10px' }}>{props.data.name}</span></div>
    </components.SingleValue >

);

const IssueSuggestionOption = (props: any) => (
    <Option {...props}>
        <div ref={props.innerRef} {...props.innerProps} style={{ display: 'flex', 'align-items': 'center' }}><img src={props.data.img} width="24" height="24" /><span style={{ marginLeft: '10px' }}>{props.data.key}</span><span style={{ marginLeft: '1em' }}>{props.data.summaryText}</span></div>
    </Option>
);

const IssueSuggestionValue = (props: any) => (
    <components.SingleValue {...props}>
        <div ref={props.innerRef} {...props.innerProps} style={{ display: 'flex', 'align-items': 'center' }}><img src={props.data.img} width="16" height="16" /><span style={{ marginLeft: '4px' }}>{props.data.key}</span><span style={{ marginLeft: '4px', marginRight: '4px' }}>{props.data.summaryText}</span></div>
    </components.SingleValue>

);

export default class InlineIssueLinksEditor extends React.Component<Props, State> {
    constructor(props: any) {
        super(props);

        this.state = {
            linkTypes: props.linkTypes,
            label: props.label,
            isEditing: false,
            isLoading: false,
            isIssueLoading: false,
            selectedIssue: undefined,
            editorContainerClassname: 'ac-hidden',
            defaultIssueValue: undefined,
            selectedLinkType: (props.linkTypes.length > 0) ? props.linkTypes[0] : undefined
        };
    }

    componentWillReceiveProps(nextProps: any) {
        const newState: any = {};

        if (nextProps.linkTypes && nextProps.linkTypes !== this.state.linkTypes) {
            newState.linkTypes = nextProps.linkTypes;
        }

        if (nextProps.label && nextProps.label !== this.state.label) {
            newState.label = nextProps.label;
        }

        if (nextProps.isLoading !== undefined && nextProps.isLoading !== this.state.isLoading) {
            newState.isLoading = nextProps.isLoading;
        }

        if (Object.keys(newState).length > 0) {
            this.setState(newState);
        }
    }

    handleOpenInlineEditor = (e: any) => {
        this.setState({ isEditing: true, editorContainerClassname: 'ac-flex-space-between' });
    }

    handleCancelInlineEdit = (value: string) => {
        this.setState({ isEditing: false, editorContainerClassname: 'ac-hidden' });
    }

    handleIssueLinkTypeChange = (newType: IssueLinkTypeSelectOption) => {
        if (this.state.selectedLinkType === undefined || newType.id !== this.state.selectedLinkType.id) {
            this.setState({ selectedLinkType: newType });
        }
    }

    handleIssueChange = (newType: IssuePickerIssue) => {
        if (this.state.selectedIssue === undefined || newType.key !== this.state.selectedIssue.key) {
            this.setState({ selectedIssue: newType });
        }
    }

    handleCancel = () => {
        this.setState({
            isEditing: false,
            defaultIssueValue: undefined,
            selectedIssue: undefined,
            selectedLinkType: (this.props.linkTypes.length > 0) ? this.props.linkTypes[0] : undefined,
        });
    }

    handleSave = (e: any) => {
        this.setState({
            isEditing: false,
            defaultIssueValue: undefined,
            selectedIssue: undefined,
            selectedLinkType: (this.props.linkTypes.length > 0) ? this.props.linkTypes[0] : undefined,
        });

        this.props.onSave({
            type: this.state.selectedLinkType!,
            issueKey: this.state.selectedIssue!.key,
        });

    }

    render() {
        return (
            <React.Fragment>
                <div className='label-and-button'>
                    <label className='ac-field-label' htmlFor='issuelinks-editor'>{this.props.label}</label>
                    <button className='ac-inline-add-button'
                        onClick={this.handleOpenInlineEditor}
                        disabled={this.state.isEditing || this.state.isLoading}
                    />
                </div>
                {this.state.isLoading &&
                    <Spinner size="small" />
                }
                <div className={this.state.editorContainerClassname}>
                    {this.state.isEditing &&
                        <React.Fragment>
                            <div style={{ width: '30%' }}>
                                <Select
                                    defaultValue={this.state.selectedLinkType}
                                    className="ac-select-container"
                                    classNamePrefix="ac-select"
                                    options={this.state.linkTypes}
                                    components={{ Option: TypeOption, SingleValue: TypeValue }}
                                    getOptionLabel={(option: any) => option.name}
                                    getOptionValue={(option: any) => option.name}
                                    isDisabled={this.state.isLoading}
                                    onChange={this.handleIssueLinkTypeChange}
                                />
                            </div>
                            <div className='ac-inline-edit-main_container-left-margin'>
                                <div style={{ width: '100%' }}>
                                    <AsyncSelect
                                        defaultValue={this.state.defaultIssueValue}
                                        className="ac-select-container"
                                        classNamePrefix="ac-select"
                                        loadOptions={this.props.onFetchIssues}
                                        getOptionLabel={(option: any) => option.key}
                                        getOptionValue={(option: any) => option.key}
                                        placeholder="Search for an issue"
                                        isLoading={this.state.isIssueLoading}
                                        isDisabled={this.state.isIssueLoading}
                                        onChange={this.handleIssueChange}
                                        components={{ Option: IssueSuggestionOption, SingleValue: IssueSuggestionValue }}
                                    />
                                </div>
                            </div>
                            <div className='ac-inline-edit-buttons-container'>
                                <button
                                    type='button'
                                    className='ac-inline-save-button'
                                    onClick={this.handleSave}
                                    disabled={this.state.selectedIssue === undefined}
                                />
                                <button
                                    type='button'
                                    className='ac-inline-cancel-button'
                                    onClick={this.handleCancel}
                                />
                            </div>
                        </React.Fragment>
                    }
                </div>
            </React.Fragment>
        );
    }
}