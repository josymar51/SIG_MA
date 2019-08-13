import * as React from "react";
import { components } from '@atlaskit/select';
import { SelectFieldUI, ValueType } from "../../jira/jira-client/model/fieldUI";
import Avatar from '@atlaskit/avatar';
import Lozenge from "@atlaskit/lozenge";

type OptionFunc = (option: any) => string;
type ComponentFunc = (props: any) => JSX.Element;

const returnOptionOrValueFunc = (option: any) => {
    let value = option;
    if (typeof option === 'object') {
        if (option.value) {
            value = option.value;
        } else {
            value = JSON.stringify(option);
        }
    }

    return value;
};

const returnOptionOrLabelFunc = (option: any) => {
    let value = option;
    if (typeof option === 'object') {
        if (option.label) {
            value = option.label;
        } else {
            value = JSON.stringify(option);
        }
    }

    return value;
};
const returnIdFunc = (option: any) => { return option.id; };
const returnNameFunc = (option: any) => { return option.name; };
const returnValueFunc = (option: any) => { return option.value; };
const returnDisplayNameFunc = (option: any) => { return option.displayName; };
const returnAccountIdFunc = (option: any) => { return option.accountId; };

const IconOption = (props: any) => {
    return (
        <components.Option {...props} >
            <div ref={props.innerRef} {...props.innerProps} style={{ display: 'flex', 'align-items': 'center' }}> <img src={props.data.iconUrl} width="24" height="24" /> <span style={{ marginLeft: '10px' }}> {props.label} </span></div>
        </components.Option>
    );
};

const SingleIconValue = (props: any) => {
    let label: string = '';
    if (props.data.name) { label = props.data.name; }
    if (props.data.value) { label = props.data.value; }
    if (typeof props.data === 'string') { label = props.data; }

    return (
        <components.SingleValue {...props}>
            <div style={{ display: 'flex', alignItems: 'center' }}><img src={props.data.iconUrl} width="16" height="16" /><span style={{ marginLeft: '10px' }}>{label}</span></div>
        </components.SingleValue >
    );
};

const MultiIconValue = (props: any) => {
    let label: string = '';
    if (props.data.name) { label = props.data.name; }
    if (props.data.value) { label = props.data.value; }
    if (typeof props.data === 'string') { label = props.data; }

    return (
        <components.MultiValueLabel {...props}>
            <div style={{ display: 'flex', alignItems: 'center' }}><img src={props.data.iconUrl} width="16" height="16" /><span style={{ marginLeft: '10px' }}>{label}</span></div>
        </components.MultiValueLabel >
    );
};

const AvatarOption = (props: any) => {
    let avatar = (props.data.avatarUrls && props.data.avatarUrls['24x24']) ? props.data.avatarUrls['24x24'] : '';
    return (
        <components.Option {...props}>
            <div ref={props.innerRef} {...props.innerProps} style={{ display: 'flex', 'align-items': 'center' }}><Avatar size='medium' borderColor='var(--vscode-dropdown-foreground)!important' src={avatar} /><span style={{ marginLeft: '4px' }}>{props.label}</span></div>
        </components.Option>
    );
};

const SingleAvatarValue = (props: any) => {
    let label: string = '';
    if (props.data.name) { label = props.data.name; }
    if (props.data.displayName) { label = props.data.displayName; }
    if (typeof props.data === 'string') { label = props.data; }

    let avatar = (props.data.avatarUrls && props.data.avatarUrls['24x24']) ? props.data.avatarUrls['24x24'] : '';
    return (
        <components.SingleValue {...props}>
            <div ref={props.innerRef} {...props.innerProps} style={{ display: 'flex', 'align-items': 'center' }}><Avatar size='small' borderColor='var(--vscode-dropdown-foreground)!important' src={avatar} /><span style={{ marginLeft: '4px' }}>{label}</span></div>
        </components.SingleValue>
    );
};

const MultiAvatarValue = (props: any) => {
    let label: string = '';
    if (props.data.name) { label = props.data.name; }
    if (props.data.displayName) { label = props.data.displayName; }
    if (typeof props.data === 'string') { label = props.data; }

    let avatar = (props.data.avatarUrls && props.data.avatarUrls['24x24']) ? props.data.avatarUrls['24x24'] : '';
    return (
        <components.MultiValueLabel {...props}>
            <div ref={props.innerRef} {...props.innerProps} style={{ display: 'flex', 'align-items': 'center' }}><Avatar size='small' borderColor='var(--vscode-dropdown-foreground)!important' src={avatar} /><span style={{ marginLeft: '4px' }}>{label}</span></div>
        </components.MultiValueLabel>
    );
};

const LabelOption = (props: any) => {
    let label = props.label;
    if (typeof props.label === 'object') {
        if (props.label.label) {
            label = props.label.label;
        } else if (props.label.value) {
            label = props.label.value;
        }
    }
    return (
        <components.Option {...props}>
            <div ref={props.innerRef} {...props.innerProps} style={{ display: 'flex', 'align-items': 'center' }}><span style={{ marginLeft: '4px' }} dangerouslySetInnerHTML={{ __html: label }} /></div>
        </components.Option>
    );
};

const LabelValue = (props: any) => {
    let value = props.data;
    if (typeof props.data === 'object') {
        if (props.data.value) {
            value = props.data.value;
        } else {
            value = JSON.stringify(props.data);
        }
    }
    return (
        <components.Option {...props}>
            <div ref={props.innerRef} {...props.innerProps} style={{ display: 'flex', 'align-items': 'center' }}><span>{value}</span></div>
        </components.Option>
    );
};

const MultiLabelValue = (props: any) => {
    let value = props.data;
    console.log('props', props);
    if (typeof props.data === 'object') {
        if (props.data.value) {
            value = props.data.value;
        } else {
            value = JSON.stringify(props.data);
        }
    }
    return (
        <components.MultiValueLabel {...props}>
            <div ref={props.innerRef} {...props.innerProps} style={{ display: 'flex', 'align-items': 'center' }}><span>{value}</span></div>
        </components.MultiValueLabel>
    );
};

const colorToLozengeAppearanceMap = {
    neutral: 'default',
    'blue-gray': 'default',
    'medium-gray': 'default',
    purple: 'new',
    brown: 'new',
    blue: 'inprogress',
    red: 'removed',
    'warm-red': 'removed',
    yellow: 'inprogress',
    green: 'success',
};

const StatusOption = (props: any) => (
    <components.Option {...props}>
        <Lozenge appearance={colorToLozengeAppearanceMap[props.data.to.statusCategory.colorName]}>
            {props.label}
        </Lozenge>
    </components.Option>
);

const StatusValue = (props: any) => (
    <components.SingleValue {...props}>
        <Lozenge appearance={colorToLozengeAppearanceMap[props.data.to.statusCategory.colorName]}>
            {props.data.to.name}
        </Lozenge>
    </components.SingleValue>

);

export namespace SelectFieldHelper {
    export enum SelectComponentType {
        Select = 'select',
        Creatable = 'creatable',
        Async = 'async',
        AsyncCreatable = 'asynccreatable'
    }

    export function selectComponentType(field: SelectFieldUI): SelectComponentType {
        if (field.isCreateable && (field.autoCompleteUrl.trim() !== '' || field.autoCompleteJql.trim() !== '')) {
            return SelectComponentType.AsyncCreatable;
        }

        if (field.isCreateable) {
            return SelectComponentType.Creatable;
        }

        if (field.autoCompleteUrl.trim() !== '' || field.autoCompleteJql.trim() !== '') {
            return SelectComponentType.Async;
        }

        return SelectComponentType.Select;
    }

    export function labelFuncForValueType(vt: ValueType): OptionFunc {
        switch (vt) {
            case ValueType.String: {
                return returnOptionOrLabelFunc;
            }
            case ValueType.Component:
            case ValueType.Version:
            case ValueType.Project:
            case ValueType.IssueType:
            case ValueType.Transition:
            case ValueType.Priority: {
                return returnNameFunc;
            }

            case ValueType.Option: {
                return returnValueFunc;
            }

            case ValueType.User:
            case ValueType.Watches: {
                return returnDisplayNameFunc;
            }

            default: {
                return returnOptionOrLabelFunc;
            }
        }
    }

    export function valueFuncForValueType(vt: ValueType): OptionFunc {
        switch (vt) {
            case ValueType.String: {
                return returnOptionOrValueFunc;
            }
            case ValueType.Component:
            case ValueType.Version:
            case ValueType.Project:
            case ValueType.IssueType:
            case ValueType.Priority:
            case ValueType.Transition:
            case ValueType.Option: {
                return returnIdFunc;
            }

            case ValueType.User:
            case ValueType.Watches: {
                return returnAccountIdFunc;
            }

            default: {
                return returnOptionOrValueFunc;
            }
        }
    }

    export function getComponentsForValueType(vt: ValueType): Object {
        return {
            ...{ Option: getOptionComponentForValueType(vt) },
            ...getValueComponentForValueType(vt)
        };
    }

    function getOptionComponentForValueType(vt: ValueType): ComponentFunc {
        switch (vt) {
            case ValueType.Priority:
            case ValueType.IssueType: {
                return IconOption;
            }

            case ValueType.Project:
            case ValueType.User:
            case ValueType.Watches: {
                return AvatarOption;
            }

            case ValueType.Transition: {
                return StatusOption;
            }

            default: {
                return LabelOption;
            }
        }
    }

    function getValueComponentForValueType(vt: ValueType): Object {
        switch (vt) {
            case ValueType.Priority:
            case ValueType.IssueType: {
                return {
                    SingleValue: SingleIconValue,
                    MultiValueLabel: MultiIconValue
                };
            }

            case ValueType.Project:
            case ValueType.User:
            case ValueType.Watches: {
                return {
                    SingleValue: SingleAvatarValue,
                    MultiValueLabel: MultiAvatarValue
                };
            }

            case ValueType.Transition: {
                return {
                    SingleValue: StatusValue
                };
            }

            default: {
                return {
                    SingleValue: LabelValue,
                    MultiValueLabel: MultiLabelValue
                }
            }
        }
    }
}