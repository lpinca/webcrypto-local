import React, { PropTypes, Component } from 'react';
import uuid from 'uuid';
import styled from 'styled-components';
import { validator } from '../../../helpers';

const FieldLabelStyled = styled.label`
  font-size: 12px;
  line-height: 16px;
  display: block;
  width: 100%;
  letter-spacing: 0.04em;
  color: ${props => props.theme.field.text.labelColor};
  margin-bottom: 4px;
`;

const ErrorTextStyled = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 100%;
  font-size: 12px;
  line-height: 1.3;
  color: ${props => props.theme.field.text.colorInvalid};
`;

const fieldReadyStyles = (props) => {
  const { theme, multiline, valid, disabled } = props;
  const transition = `${theme.basicTransition}ms`;
  let placeholderColor = theme.field.text.placeholderColor;
  let color = theme.field.text.color;
  let borderColor = theme.field.text.borderColor;
  let borderColorActive = theme.field.text.borderColorActive;

  if (!valid) {
    borderColor = theme.field.text.borderColorInvalid;
    borderColorActive = borderColor;
  }

  if (disabled) {
    placeholderColor = theme.field.text.placeholderColorDisabled;
    color = theme.field.text.colorDisabled;
    borderColor = theme.field.text.borderColorDisabled;
    borderColorActive = borderColor;
  }

  return `
    width: 100%;
    font-size: 12px;
    letter-spacing: 0.07em;
    padding: ${multiline ? '10' : '0 10'}px;
    height: ${multiline ? 100 : 28}px;
    border-radius: ${theme.borderRadius}px;
    transition: border-color ${transition}, color ${transition};
    border: 1px solid ${borderColor};
    color: ${color};
    user-select: text;
    &:hover,
    &:focus {
      border-color: ${borderColorActive};
    }
    &:-moz-placeholder {
      color: ${placeholderColor};
    }
    &::-webkit-input-placeholder {
      color: ${placeholderColor};
    }
    &::-moz-placeholder {
      color: ${placeholderColor};
    }
    &:-ms-input-placeholder {
      color: $${placeholderColor};
    }
    ${theme.mixins.truncateText}
  `;
};

const FieldContainerStyled = styled.div`
  position: relative;
`;

export default class TextField extends Component {

  static propTypes = {
    multiline: PropTypes.bool,
    disabled: PropTypes.bool,
    name: PropTypes.string,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onKeyUp: PropTypes.func,
    onClick: PropTypes.func,
    type: PropTypes.string,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    labelText: PropTypes.string,
    placeholder: PropTypes.string,
    validation: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.string,
    ]),
    capitalize: PropTypes.bool,
    readOnly: PropTypes.bool,
    errorText: PropTypes.string,
  };

  static defaultProps = {
    disabled: false,
    multiline: false,
    type: 'text',
  };

  constructor(props) {
    super();

    this.state = {
      valid: true,
    };

    this.supportedTypes = ['text', 'email', 'password'];
    this.fieldId = uuid();
    this.FieldStyled = styled[props.multiline ? 'textarea' : 'input']`
      ${p => fieldReadyStyles(p)}
    `;
  }

  componentDidMount() {
    const { value, validation, type } = this.props;

    if (validation && value) {
      this.setState({
        valid: validator(value, validation),
      });
    }

    if (this.supportedTypes.indexOf(type) === -1) {
      throw new Error(`Unsupported TextField type. Support: ${this.supportedTypes.join(', ')}`);
    }
  }

  componentDidUpdate(prevProps) {
    const { fieldNode } = this;
    const { value } = this.props;

    if (prevProps.value !== this.props.value) {
      if (fieldNode.value !== value) {
        fieldNode.value = value;
      }
    }
  }

  onFocusHandler = () => {
    const value = this.getValue();
    const { onFocus } = this.props;
    if (onFocus) onFocus(value);
  };

  onBlurHandler = () => {
    setTimeout(() => {
      this.validate();
      const value = this.getValue();
      const { onBlur } = this.props;
      if (onBlur) onBlur(value);
    }, 100);
  };

  onKeyUpHandler = (e) => {
    const { onKeyUp } = this.props;
    if (onKeyUp) onKeyUp(e);
  };

  onChangeHandler = () => {
    const { onChange, name } = this.props;
    const value = this.getValue();
    const valid = this.isValid();

    if (onChange) {
      onChange(value, valid, name);
    }
  };

  validate = () => {
    const valid = this.isValid();

    this.setState({
      valid,
    });
  };

  isValid = () => {
    const { validation } = this.props;
    const value = this.getValue();
    let valid = true;

    if (validation) {
      valid = validator(value, validation);
    }

    return valid;
  };

  onClickHandler = (e) => {
    const { onClick } = this.props;
    if (onClick) {
      onClick(e);
    }
  };

  getValue = () => {
    const { fieldNode } = this;
    const { capitalize } = this.props;
    const value = fieldNode.value;

    if (capitalize) return value.charAt(0).toUpperCase() + value.slice(1);

    return value;
  };

  resetValue() {
    const { fieldNode } = this;
    fieldNode.value = '';
  }

  render() {
    const {
      labelText,
      placeholder,
      disabled,
      name,
      type,
      multiline,
      value,
      readOnly,
      errorText,
    } = this.props;
    const { valid } = this.state;

    return (
      <FieldContainerStyled>
        {
          labelText
          ? <FieldLabelStyled htmlFor={this.fieldId}>
            { labelText }
          </FieldLabelStyled>
          : null
        }
        <this.FieldStyled
          innerRef={node => (this.fieldNode = node)}
          tabIndex={0}
          id={this.fieldId}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          name={name}
          defaultValue={value}
          multiline={multiline}
          valid={valid}
          onFocus={this.onFocusHandler}
          onBlur={this.onBlurHandler}
          onChange={this.onChangeHandler}
          onKeyUp={this.onKeyUpHandler}
          onClick={this.onClickHandler}
          readOnly={readOnly}
        />
        {
          errorText && !valid
          ? <ErrorTextStyled>
            { errorText }
          </ErrorTextStyled>
          : null
        }
      </FieldContainerStyled>
    );
  }
}
