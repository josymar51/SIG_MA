import React, { PureComponent } from "react";
import Modal, { ModalTransition } from "@atlaskit/modal-dialog";
import { JQLAutocompleteInput } from "./JQLAutocompleteInput";
import { JQLEntry } from "src/config/model";
import { Field, ErrorMessage } from '@atlaskit/form';
import Select, { components } from '@atlaskit/select';
import { FieldValidators, chain } from "../fieldValidators";
import Button from '@atlaskit/button';
import SectionMessage from '@atlaskit/section-message';
import { DetailedSiteInfo } from "../../../atlclients/authInfo";
import { applyWorkingProject, WorkingProjectDisplayName } from "../../../jira/JqlWorkingProjectHelper";
import axios from "axios";

const IconOption = (props: any) => (
  <components.Option {...props}>
    <div ref={props.innerRef} {...props.innerProps} style={{ display: 'flex', alignItems: 'center' }}><img src={props.data.avatarUrl} width="24" height="24" /><span style={{ marginLeft: '10px' }}>{props.data.name}</span></div>
  </components.Option>
);

const IconValue = (props: any) => (
  <components.SingleValue {...props}>
    <div style={{ display: 'flex', alignItems: 'center' }}><img src={props.data.avatarUrl} width="16" height="16" /><span style={{ marginLeft: '10px' }}>{props.data.name}</span></div>
  </components.SingleValue>

);

export default class EditJQL extends PureComponent<{
  jiraAccessToken: string;
  defaultSiteId: string;
  workingProject: string;
  sites: DetailedSiteInfo[];
  jqlEntry: JQLEntry;
  nameEditable?: boolean;
  onCancel: () => void;
  onRestoreDefault?: (jqlEntry: JQLEntry) => void;
  onSave: (siteId: string, jqlEntry: JQLEntry) => void;
}, {
  selectedSiteId: string;
  nameValue: string;
  inputValue: string;
  openComplete: boolean;
  jqlError: string | null;
  isEditing: boolean;
}> {
  state = {
    selectedSiteId: this.props.defaultSiteId,
    nameValue: this.props.jqlEntry.name,
    inputValue: this.props.jqlEntry.query,
    openComplete: false,
    jqlError: null,
    isEditing: false
  };

  async fetchEndpoint(endpoint: string): Promise<any> {
    const fullUrl = `https://api.atlassian.com/ex/jira/${
      this.state.selectedSiteId
      }/rest/api/2/${endpoint}`;

    return axios(fullUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.props.jiraAccessToken}`,
        "Content-Type": "application/json"
      }
    }).then(res => { return res.data; });
  }

  getSuggestionsRequest = async (fieldName: string, fieldValue: string) => {
    return this.fetchEndpoint(
      `jql/autocompletedata/suggestions?fieldName=${fieldName}&fieldValue=${fieldValue}`
    );
  }

  validationRequest = async (jql: string) => {
    const effectiveJql = applyWorkingProject(this.props.workingProject, jql);
    this.fetchEndpoint(
      `search?startAt=0&maxResults=1&validateQuery=strict&fields=summary&jql=${effectiveJql}`
    ).then((res: any) => {
      if (res.errorMessages && res.errorMessages.length > 0) {
        this.setState({
          jqlError: JSON.stringify(res.errorMessages[0])
        });
      } else {
        this.setState({ jqlError: null });
      }
    });
  }

  getAutocompleteDataRequest = () => {
    return this.fetchEndpoint("jql/autocompletedata");
  }

  handleSiteChange = (e: DetailedSiteInfo) => {
    this.setState({
      selectedSiteId: e.id
    });
  }

  onJQLChange = (e: any) => {
    this.setState({
      inputValue: e.target.value
    });
  }

  onJQLOpenChange = (isOpen: boolean) => {
    this.setState({
      isEditing: isOpen
    });
  }

  onNameChange = (e: any) => {
    this.setState({
      nameValue: e.target.value
    });
  }

  onSave = () => {
    var entry = this.props.jqlEntry;

    this.props.onSave(this.state.selectedSiteId, Object.assign({}, entry, { name: this.state.nameValue, query: this.state.inputValue }));
  }

  onRestoreDefault = () => {
    var entry = this.props.jqlEntry;
    if (this.props.onRestoreDefault) {
      this.props.onRestoreDefault(entry);
    }
  }

  onOpenComplete = () => {
    this.setState({ openComplete: true });
  }

  render() {
    return (
      <ModalTransition>
        <Modal
          onClose={this.props.onCancel}
          heading="Edit JQL"
          onOpenComplete={this.onOpenComplete}
          shouldCloseOnEscapePress={false}
        >
          <Field label='Name'
            isRequired={this.props.nameEditable === undefined || this.props.nameEditable}
            id='jql-name-input'
            name='jql-name-input'
            defaultValue={this.state.nameValue}
            validate={FieldValidators.validateString}>
            {
              (fieldArgs: any) => {
                let errDiv = <span />;
                if (fieldArgs.error === 'EMPTY') {
                  errDiv = <ErrorMessage>Name is required</ErrorMessage>;
                }
                return (
                  <div>
                    <input {...fieldArgs.fieldProps}
                      style={{ width: '100%', display: 'block' }}
                      className='ac-inputField'
                      readOnly={this.props.nameEditable !== undefined && !this.props.nameEditable}
                      onChange={chain(fieldArgs.fieldProps.onChange, this.onNameChange)} />
                    {errDiv}
                  </div>
                );
              }
            }
          </Field>

          {
            this.props.sites.length > 0 &&
            <Field label='Select Site'
              id='site'
              name='site'
              defaultValue={this.props.defaultSiteId}
            >
              {
                (fieldArgs: any) => {
                  return (
                    <Select
                      {...fieldArgs.fieldProps}
                      className="ac-select-container"
                      classNamePrefix="ac-select"
                      getOptionLabel={(option: any) => option.name}
                      getOptionValue={(option: any) => option.id}
                      options={this.props.sites}
                      components={{ Option: IconOption, SingleValue: IconValue }}
                      onChange={chain(fieldArgs.fieldProps.onChange, this.handleSiteChange)}
                    />
                  );
                }
              }
            </Field>
          }
          {this.state.jqlError && !this.state.isEditing &&
            <div style={{ marginTop: '24px' }}>
              <SectionMessage appearance="error" title="JQL Error">
                <div>{this.state.jqlError}</div>
              </SectionMessage>
            </div>
          }


          {this.state.openComplete &&
            <JQLAutocompleteInput
              getAutocompleteDataRequest={this.getAutocompleteDataRequest}
              getSuggestionsRequest={this.getSuggestionsRequest}
              initialValue={this.state.inputValue}
              inputId={"jql-automplete-input"}
              label={"Query"}
              onChange={this.onJQLChange}
              onEditorOpenChange={this.onJQLOpenChange}
              validationRequest={this.validationRequest}
              jqlError={this.state.jqlError}
            />
          }
          <p><strong>Tip:</strong> You can use <code>project = {WorkingProjectDisplayName}</code> to restrict the query to issues in your working project. It's not actually valid JQL, but we'll take care of it.</p>
          <div style={{
            marginTop: '24px',
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <div style={{ display: 'inline-flex', marginRight: '4px', marginLeft: '4px;' }}>
              <Button
                className='ac-button'
                isDisabled={(this.state.nameValue.trim().length < 1 || this.state.inputValue.trim().length < 1 || this.state.jqlError !== null)}
                onClick={this.onSave}
              >
                Save
            </Button>
            </div>
            {this.props.onRestoreDefault &&
              <div style={{ display: 'inline-flex', marginRight: '4px', marginLeft: '4px;' }}>
                <Button
                  className='ac-button'
                  isDisabled={(this.state.nameValue.trim().length < 1 || this.state.inputValue.trim().length < 1 || this.state.jqlError !== null)}
                  onClick={this.onRestoreDefault}
                >
                  Restore Default
            </Button>
              </div>
            }
            <div style={{ display: 'inline-flex', marginRight: '4px', marginLeft: '4px;' }}>
              <Button
                className='ac-button'
                onClick={this.props.onCancel}
              >
                Cancel
            </Button>
            </div>
          </div>
        </Modal>
      </ModalTransition>
    );
  }
}
