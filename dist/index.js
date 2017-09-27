'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _countryData = require('country-data');

var _countryData2 = _interopRequireDefault(_countryData);

var _googleLibphonenumber = require('google-libphonenumber');

var _escapeStringRegexp = require('escape-string-regexp');

var _escapeStringRegexp2 = _interopRequireDefault(_escapeStringRegexp);

var _FlagIcon = require('react-flag-kit/lib/FlagIcon');

var _FlagIcon2 = _interopRequireDefault(_FlagIcon);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var IntlTelInput = function (_Component) {
  _inherits(IntlTelInput, _Component);

  function IntlTelInput() {
    _classCallCheck(this, IntlTelInput);

    var _this = _possibleConstructorReturn(this, (IntlTelInput.__proto__ || Object.getPrototypeOf(IntlTelInput)).call(this));

    _this.phoneUtil = _googleLibphonenumber.PhoneNumberUtil.getInstance();
    _this.countries = _countryData2.default.callingCountries.all.filter(function (country) {
      return country.status === 'assigned';
    });
    _this.mouseDownOnMenu = false;
    _this._pageClick = _this.pageClick.bind(_this);
    _this.missingFlags = { AQ: 'WW', BQ: 'NL', EH: 'WW-AFR', MF: 'FR', SH: 'GB' };
    _this.boxShadowStyle = '0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.4)';
    _this.bgColorTransitionStyle = 'background-color .25s, color .25s';
    _this.state = {
      open: false,
      selectedCountry: {},
      intlPhoneNumber: '',
      phoneNumber: '',
      searchTerm: '',
      valid: false,
      filteredCountries: [],
      preferredCountries: [],
      paginateCount: 1,
      multiSelectOpen: false,
      multiSelectItem: {},
      lastPreferred: '',
      tabbedIndex: -1
    };
    return _this;
  }

  _createClass(IntlTelInput, [{
    key: 'getPreferredCountries',
    value: function getPreferredCountries() {
      var preferredCountries = this.props.preferredCountries;

      if (preferredCountries && preferredCountries.length) {
        var _preferredCountries = preferredCountries.map(function (country) {
          return country.toUpperCase();
        });
        var preferred = this.countries.filter(function (country) {
          return _preferredCountries.indexOf(country.alpha2) !== -1;
        }).reverse();
        var regular = this.countries.filter(function (country) {
          return _preferredCountries.indexOf(country.alpha2) === -1;
        });
        var orderedCountries = preferred.concat(regular);
        this.setState({ preferredCountries: orderedCountries, lastPreferred: preferred[preferred.length - 1] });
        return orderedCountries;
      }
    }
  }, {
    key: 'mapErrorMessage',
    value: function mapErrorMessage(message) {
      var _props = this.props,
          minLengthMessage = _props.minLengthMessage,
          maxLengthMessage = _props.maxLengthMessage,
          callingCodeMessage = _props.callingCodeMessage,
          catchAllMessage = _props.catchAllMessage;

      if (message === 'The string supplied did not seem to be a phone number' || message === 'The string supplied is too short to be a phone number' || message === 'Phone number too short after IDD') {
        return minLengthMessage;
      } else if (message === 'The string supplied is too long to be a phone number') {
        return maxLengthMessage;
      } else if (message === 'Invalid country calling code') {
        return callingCodeMessage;
      } else {
        return catchAllMessage;
      }
    }
  }, {
    key: 'formatValidation',
    value: function formatValidation(valid, internalMessage, friendlyMessage, parsed, intlPhoneNumber) {
      return {
        valid: valid,
        internalMessage: internalMessage,
        friendlyMessage: friendlyMessage,
        parsed: parsed,
        intlPhoneNumber: intlPhoneNumber
      };
    }
  }, {
    key: 'validateNumber',
    value: function validateNumber(alpha2, phoneNumber) {
      if (alpha2) {
        var _alpha2 = alpha2 === 'unknown' ? '' : alpha2;
        try {
          this.phoneUtil.parse(phoneNumber, _alpha2);
        } catch (e) {
          var message = e.message;

          return this.formatValidation(false, message, this.mapErrorMessage(message), null, null);
        }
        var validMessage = this.props.validMessage;

        var parsed = this.phoneUtil.parse(phoneNumber, _alpha2);
        var valid = this.phoneUtil.isPossibleNumber(parsed);
        var intlPhoneNumber = this.phoneUtil.format(parsed, _googleLibphonenumber.PhoneNumberFormat.INTERNATIONAL);
        return this.formatValidation(valid, '', valid ? validMessage : this.mapErrorMessage(), parsed, intlPhoneNumber);
      } else {
        var callingCodeMessage = this.props.callingCodeMessage;

        return this.formatValidation(false, '', callingCodeMessage, null, null);
      }
    }
  }, {
    key: 'onKeyDown',
    value: function onKeyDown(e) {
      var _this2 = this;

      var _state = this.state,
          tabbedIndex = _state.tabbedIndex,
          paginateCount = _state.paginateCount,
          open = _state.open,
          filteredCountries = _state.filteredCountries;

      if (open) {
        var dropdownItemHeight = parseInt(window.getComputedStyle(this.countryDropdown.children[0]).getPropertyValue('height'));
        var dropdownHeight = parseInt(window.getComputedStyle(this.countryDropdown).getPropertyValue('height'));
        var halfwayPoint = dropdownHeight / dropdownItemHeight / 2;
        var paginate = this.props.paginate;

        var key = e.key;
        if (key === 'Escape') {
          this.setState({ open: false, tabbedIndex: -1 });
        } else if (key === 'ArrowDown' || key === 'Tab' && !e.shiftKey) {
          e.preventDefault();
          var newIndex = tabbedIndex === filteredCountries.length ? filteredCountries.length : tabbedIndex + 1;
          this.setState({ tabbedIndex: newIndex }, function () {
            _this2.countryDropdown.scrollTop = dropdownItemHeight * (newIndex - halfwayPoint);
            if (paginate && paginateCount && paginate * paginateCount === newIndex - 2) {
              _this2.setState({ paginateCount: paginateCount + 1 });
            }
          });
        } else if (key === 'ArrowUp' || key === 'Tab' && e.shiftKey) {
          e.preventDefault();
          var _newIndex = tabbedIndex === 0 ? 0 : tabbedIndex - 1;
          this.setState({ tabbedIndex: _newIndex }, function () {
            _this2.countryDropdown.scrollTop = dropdownItemHeight * (_newIndex - halfwayPoint);
          });
        } else if (key === 'Enter' || e.keyCode === 32 || e.which === 32) {
          if (tabbedIndex) {
            var _filteredCountries = this.state.filteredCountries;

            this.selectCountry(_filteredCountries[tabbedIndex - 1], false, false, true);
          }
        }
      }
    }
  }, {
    key: 'lookupCountry',
    value: function lookupCountry(callingCode) {
      return callingCode.toString().trim() === '1' ? _countryData2.default.countries.US : _countryData2.default.lookup.countries({ countryCallingCodes: '+' + callingCode }).filter(function (country) {
        return country.status === 'assigned';
      })[0];
    }
  }, {
    key: 'testNumber',
    value: function testNumber(number) {
      return new RegExp(/^[0-9]+$/).test(number);
    }
  }, {
    key: 'unformatNumber',
    value: function unformatNumber(number) {
      var _number = !isNaN(number) ? number.toString() : number;
      return _number ? _number.replace(/[^0-9]/g, '') : number;
    }
  }, {
    key: 'getNationalNumber',
    value: function getNationalNumber(alpha2, number) {
      return number && alpha2 && alpha2.length ? number.substr(alpha2.length + 1) : '';
    }
  }, {
    key: 'formatNumber',
    value: function formatNumber(alpha2, number) {
      var unformattedNumber = this.unformatNumber(unformattedNumber);
      var formatter = new _googleLibphonenumber.AsYouTypeFormatter(alpha2);
      var formattedNumberArray = ('+' + number).split('').map(function (char) {
        return formatter.inputDigit(char);
      });
      var intlPhoneNumber = formattedNumberArray.length ? formattedNumberArray[formattedNumberArray.length - 1] : unformattedNumber;
      formatter.clear();
      return intlPhoneNumber;
    }
  }, {
    key: 'onChangeCallback',
    value: function onChangeCallback(country) {
      if (country) {
        this.selectCountry(country);
      }
    }
  }, {
    key: 'onChangePhone',
    value: function onChangePhone() {
      var _this3 = this;

      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var _state2 = this.state,
          selectedCountry = _state2.selectedCountry,
          callingCode = _state2.callingCode;

      var unformattedNumber = this.unformatNumber(value);
      var lookupCountry = this.lookupCountry(value.replace('+', ''));
      var country = lookupCountry || Object.keys(selectedCountry).length > 0 && selectedCountry;
      if (this.testNumber(unformattedNumber) && value !== callingCode) {
        if (country) {
          var alpha2 = country.alpha2;

          var intlPhoneNumber = this.formatNumber(alpha2, unformattedNumber);
          var phoneNumber = this.getNationalNumber(alpha2, intlPhoneNumber);
          var validation = this.validateNumber(alpha2, intlPhoneNumber);
          var friendlyMessage = validation.friendlyMessage,
              valid = validation.valid;

          this.setState({ intlPhoneNumber: intlPhoneNumber, phoneNumber: phoneNumber, message: friendlyMessage, valid: valid }, function () {
            return _this3.onChangeCallback(country);
          });
        }
      } else if (unformattedNumber.length < 1) {
        this.setState({ intlPhoneNumber: unformattedNumber }, function () {
          return function () {
            return _this3.onChangeCallback(country);
          };
        });
      } else {
        this.setState({ intlPhoneNumber: value }, function () {
          return function () {
            return _this3.onChangeCallback(country);
          };
        });
      }
    }
  }, {
    key: 'cancelMultiSelect',
    value: function cancelMultiSelect() {
      var _this4 = this;

      this.setState({ multiSelectOpen: false, multiSelectItem: {} }, function () {
        _this4.multiSelect.style.zIndex = '-1';
      });
    }
  }, {
    key: 'onChangeTypeAhead',
    value: function onChangeTypeAhead(value) {
      var _state3 = this.state,
          preferredCountries = _state3.preferredCountries,
          searchTerm = _state3.searchTerm;

      var filteredCountries = this.countries.filter(function (country) {
        var name = country.name,
            countryCallingCodes = country.countryCallingCodes;

        var searchCriteria = name + ' ' + countryCallingCodes.join(' ');
        return new RegExp((0, _escapeStringRegexp2.default)(value.trim()), 'gi').test(searchCriteria);
      });
      this.setState({ filteredCountries: value.trim() === '' ? preferredCountries : filteredCountries, searchTerm: value, tabbedIndex: -1 });
    }
  }, {
    key: 'selectCountry',
    value: function selectCountry(country) {
      var mounted = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var _this5 = this;

      var multiSelect = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var onClick = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      var onChange = this.props.onChange;
      var countryCallingCodes = country.countryCallingCodes,
          alpha2 = country.alpha2;
      var _state4 = this.state,
          intlPhoneNumber = _state4.intlPhoneNumber,
          phoneNumber = _state4.phoneNumber,
          searchTerm = _state4.searchTerm;

      if (countryCallingCodes && countryCallingCodes.length > 1 && !multiSelect) {
        return this.setState({ multiSelectOpen: true, multiSelectItem: country }, function () {
          _this5.multiSelect.style.zIndex = '101';
        });
      }
      var callingCode = multiSelect || countryCallingCodes && countryCallingCodes[0];
      var _intlPhoneNumber = mounted ? intlPhoneNumber : this.formatNumber(alpha2, this.unformatNumber('' + callingCode + phoneNumber));
      var validation = this.validateNumber(alpha2, _intlPhoneNumber);
      this.setState({ selectedCountry: country, callingCode: callingCode, open: false, tabbedIndex: -1, searchTerm: searchTerm.trim() }, function () {
        if (onClick) {
          _this5.setState({ intlPhoneNumber: _intlPhoneNumber });
        }
        _this5.cancelMultiSelect();
        if (!mounted) {
          _this5.phoneInput.focus();
          if (onChange) {
            onChange(Object.assign({}, country, validation, { callingCode: callingCode, phoneNumber: phoneNumber, intlPhoneNumber: _intlPhoneNumber }));
          }
        }
      });
    }
  }, {
    key: 'pageClick',
    value: function pageClick() {
      var _this6 = this;

      if (!this.mouseDownOnMenu) {
        this.setState({ open: false, tabbedIndex: -1 }, function () {
          _this6.countryDropdown.scrollTop = 0;
        });
        this.cancelMultiSelect();
      }
    }
  }, {
    key: 'onOpenHandler',
    value: function onOpenHandler() {
      var disabled = this.props.disabled;

      if (!disabled) {
        var open = this.state.open;

        this.setState({ open: !open });
        if (!open) {
          this.phoneInput.focus();
        } else {
          this.setState({ tabbedIndex: -1 });
        }
      }
    }
  }, {
    key: 'clearInput',
    value: function clearInput() {
      var _state5 = this.state,
          open = _state5.open,
          selectedCountry = _state5.selectedCountry,
          callingCode = _state5.callingCode;

      if (open) {
        this.setState({ searchTerm: '', filteredCountries: this.getPreferredCountries(), multiSelectItem: [], multiSelectOpen: false });
      } else if (selectedCountry === 'unknown') {
        this.setState({ intlPhoneNumber: '', phoneNumber: '' });
        this.onChangePhone('');
      } else {
        this.setState({ intlPhoneNumber: '', phoneNumber: '' });
        this.cancelMultiSelect();
      }
      this.phoneInput.focus();
    }
  }, {
    key: 'mouseDownHandler',
    value: function mouseDownHandler() {
      this.mouseDownOnMenu = true;
    }
  }, {
    key: 'mouseUpHandler',
    value: function mouseUpHandler() {
      this.mouseDownOnMenu = false;
    }
  }, {
    key: 'getBgColor',
    value: function getBgColor(index, selected) {
      var _state6 = this.state,
          tabbedIndex = _state6.tabbedIndex,
          hoverIndex = _state6.hoverIndex;

      var hovered = index === hoverIndex;
      var tabbed = index === tabbedIndex;
      if (tabbed) {
        return '#EBEBEB';
      } else if (selected && hovered) {
        return '#BBDEF8';
      } else if (selected) {
        return '#E3F2FD';
      } else if (hovered) {
        return '#EBEBEB';
      }
    }
  }, {
    key: 'propChangeHandler',
    value: function propChangeHandler(props, mounted, reset) {
      var _this7 = this;

      var selectedCountry = this.state.selectedCountry;
      var defaultCountry = props.defaultCountry,
          defaultValue = props.defaultValue;

      var countryNotSelected = Object.keys(selectedCountry).length < 1 && selectedCountry !== 'unknown';
      if (defaultValue) {
        var _validateNumber = this.validateNumber('unknown', defaultValue),
            intlPhoneNumber = _validateNumber.intlPhoneNumber,
            parsed = _validateNumber.parsed;

        if (intlPhoneNumber) {
          this.setState({ intlPhoneNumber: intlPhoneNumber, phoneNumber: parsed.getNationalNumber().toString() }, function () {
            _this7.selectCountry(_this7.lookupCountry(parsed.getCountryCode()), mounted || reset);
          });
        } else {
          this.setState({ intlPhoneNumber: defaultValue, selectedCountry: 'unknown' });
        }
      } else if (defaultCountry && countryNotSelected) {
        this.setState({ intlPhoneNumber: '', phoneNumber: '' }, function () {
          _this7.selectCountry(_countryData2.default.countries[defaultCountry], mounted || reset);
        });
      }
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var reset = nextProps.reset,
          defaultValue = nextProps.defaultValue;

      if (reset || this.props.defaultValue !== defaultValue) {
        this.propChangeHandler(nextProps, false, reset);
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      window.addEventListener('mousedown', this._pageClick);
      this.propChangeHandler(this.props, true);
      this.setState({ filteredCountries: this.getPreferredCountries() });
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      window.removeEventListener('mousedown', this._pageClick);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this8 = this;

      var _state7 = this.state,
          open = _state7.open,
          selectedCountry = _state7.selectedCountry,
          intlPhoneNumber = _state7.intlPhoneNumber,
          filteredCountries = _state7.filteredCountries,
          searchTerm = _state7.searchTerm,
          paginateCount = _state7.paginateCount,
          multiSelectOpen = _state7.multiSelectOpen,
          multiSelectItem = _state7.multiSelectItem,
          lastPreferred = _state7.lastPreferred,
          tabbedIndex = _state7.tabbedIndex,
          message = _state7.message,
          valid = _state7.valid,
          hover = _state7.hover;
      var _props2 = this.props,
          noResultsMessage = _props2.noResultsMessage,
          className = _props2.className,
          removeToken = _props2.removeToken,
          paginate = _props2.paginate,
          paginateText = _props2.paginateText,
          placeholder = _props2.placeholder,
          maxHeight = _props2.maxHeight,
          disabled = _props2.disabled,
          inputClassName = _props2.inputClassName,
          callingCodeDivider = _props2.callingCodeDivider;
      var alpha2 = selectedCountry.alpha2;

      var inputID = _uuid2.default.v4();
      var tabbedCountry = filteredCountries.length > 0 && filteredCountries[0].alpha2;
      var flag = (this.missingFlags[alpha2] ? this.missingFlags[alpha2] : selectedCountry !== 'unknown' && Object.keys(selectedCountry).length > 0 && alpha2.toUpperCase()) || 'WW';
      return _react2.default.createElement(
        'div',
        {
          style: { position: 'relative', boxShadow: open ? this.boxShadowStyle : null },
          ref: function ref(input) {
            _this8.intlPhoneInput = input;
          },
          className: 'intl-phone-input' + (open ? ' open' : ''),
          onMouseDown: function onMouseDown() {
            return _this8.mouseDownHandler();
          },
          onMouseUp: function onMouseUp() {
            return _this8.mouseUpHandler();
          } },
        _react2.default.createElement(
          'div',
          { className: 'input-group' },
          _react2.default.createElement(
            'div',
            { className: 'input-group-btn' },
            _react2.default.createElement(
              'button',
              {
                type: 'button',
                tabIndex: 0,
                disabled: disabled,
                'aria-hidden': true,
                style: { borderBottomLeftRadius: open ? 0 : null, transition: this.bgColorTransitionStyle, cursor: disabled ? null : 'pointer' },
                className: 'btn btn-secondary btn-primary dropdown-toggle country-selector',
                onClick: function onClick(e) {
                  return _this8.onOpenHandler(e);
                } },
              flag && _react2.default.createElement(_FlagIcon2.default, { code: flag, size: 24, className: 'flag-icon' })
            )
          ),
          (open && searchTerm.length > 0 || !open && intlPhoneNumber.length > 0) && !disabled && _react2.default.createElement(
            'span',
            {
              'aria-hidden': 'true',
              className: 'remove-token-container',
              style: { position: 'absolute', userSelect: 'none', zIndex: 10, fontSize: 26, right: 15, cursor: 'pointer' } },
            _react2.default.createElement(
              'span',
              { style: { cursor: 'pointer' }, onClick: function onClick() {
                  return _this8.clearInput();
                } },
              removeToken
            )
          ),
          _react2.default.createElement(
            'label',
            { htmlFor: inputID, 'aria-hidden': !open, className: 'sr-only' },
            'Please enter your country\'s calling code followed by your phone number'
          ),
          _react2.default.createElement(
            'div',
            { id: 'validation-info', 'aria-hidden': !open, 'aria-live': 'assertive', className: 'sr-only' },
            message,
            '. ',
            Object.keys(selectedCountry).length > 0 && selectedCountry.name ? 'You have entered a calling code for ' + selectedCountry.name + '.' : ''
          ),
          _react2.default.createElement('input', {
            id: inputID,
            autoComplete: 'off',
            'aria-describedby': 'validation-info',
            type: 'text',
            ref: function ref(input) {
              _this8.phoneInput = input;
            },
            className: 'form-control phone-input' + (inputClassName ? inputClassName : ''),
            style: { paddingRight: 38, borderBottomLeftRadius: open ? 0 : null, borderBottomRightRadius: open ? 0 : null },
            placeholder: open ? placeholder : '',
            onKeyDown: function onKeyDown(e) {
              return _this8.onKeyDown(e);
            },
            value: open ? searchTerm : intlPhoneNumber,
            disabled: disabled,
            onChange: function onChange(e) {
              return open ? _this8.onChangeTypeAhead(e.target.value) : _this8.onChangePhone(e.target.value);
            }
          })
        ),
        _react2.default.createElement(
          'ul',
          {
            'aria-hidden': true,
            tabIndex: -1,
            ref: function ref(dropdown) {
              _this8.countryDropdown = dropdown;
            },
            className: 'dropdown-menu country-dropdown',
            style: { display: 'block', zIndex: 101, overflowX: 'scroll', marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, maxHeight: open ? maxHeight : 0, boxShadow: open ? this.boxShadowStyle : null, borderWidth: open ? 1 : 0, padding: open ? '10px 0 10px 0' : 0, transition: 'all 0.2s ease', width: '100%', borderTop: 'none' } },
          filteredCountries && filteredCountries.length > 0 && filteredCountries.map(function (country, index) {
            var name = country.name,
                alpha2 = country.alpha2,
                countryCallingCodes = country.countryCallingCodes;

            var paginateTo = paginate && parseInt(paginate) * paginateCount;
            if (index <= paginateTo) {
              return _react2.default.createElement(
                'li',
                {
                  id: alpha2,
                  tabIndex: 0,
                  onMouseEnter: function onMouseEnter() {
                    return _this8.setState({ hoverIndex: index });
                  },
                  onMouseLeave: function onMouseLeave() {
                    return _this8.setState({ hoverIndex: NaN });
                  },
                  className: 'dropdown-item' + (tabbedIndex === index + 1 ? ' tabbed' : ''),
                  key: alpha2 + '-' + index,
                  style: { padding: 15, cursor: 'pointer', borderBottom: lastPreferred && lastPreferred.alpha2 === alpha2 && searchTerm === '' ? '1px solid #c1c1c1' : '', transition: _this8.bgColorTransitionStyle, backgroundColor: _this8.getBgColor(index, alpha2 === selectedCountry.alpha2) },
                  onClick: function onClick() {
                    return _this8.selectCountry(country, false, false, true);
                  } },
                _react2.default.createElement(
                  'h6',
                  { style: { margin: 0 } },
                  _react2.default.createElement(_FlagIcon2.default, { style: { marginRight: 10 }, code: _this8.missingFlags[alpha2] ? _this8.missingFlags[alpha2] : alpha2, size: 30 }),
                  name,
                  '\xA0',
                  countryCallingCodes.map(function (code, index) {
                    return _react2.default.createElement(
                      'small',
                      { className: 'text-muted', key: code },
                      code,
                      index !== countryCallingCodes.length - 1 && _react2.default.createElement(
                        'span',
                        { key: code + '-divider' },
                        callingCodeDivider
                      )
                    );
                  })
                )
              );
            }
            if (index - 1 === paginateTo) {
              return _react2.default.createElement(
                'div',
                {
                  className: 'dropdown-item',
                  'aria-hidden': true,
                  style: { padding: 15, cursor: 'pointer', transition: _this8.bgColorTransitionStyle },
                  key: 'addit-results-' + index,
                  onClick: function onClick() {
                    return _this8.setState({ paginateCount: paginateCount + 1 });
                  } },
                paginateText
              );
            }
          }),
          filteredCountries && filteredCountries.length === 0 && _react2.default.createElement(
            'div',
            { style: { padding: 15, cursor: 'pointer', transition: this.bgColorTransitionStyle }, className: 'dropdown-item' },
            noResultsMessage
          ),
          _react2.default.createElement(
            'div',
            {
              ref: function ref(select) {
                _this8.multiSelect = select;
              },
              'aria-hidden': !multiSelectOpen,
              className: 'text-center calling-code-multi-select' + (multiSelectOpen ? ' open' : ''),
              style: { opacity: multiSelectOpen ? 1 : 0, zIndex: multiSelectOpen ? 'auto' : -1, transition: 'all 0.2s ease', backgroundColor: 'white', position: 'absolute', top: 0, left: 0, height: '100%', width: '100%' } },
            _react2.default.createElement(
              'button',
              {
                type: 'button',
                'aria-hidden': !multiSelectOpen,
                'aria-label': 'close',
                onClick: function onClick() {
                  return _this8.cancelMultiSelect();
                },
                style: { position: 'absolute', left: 10, bottom: 10 },
                className: 'btn btn-outline btn-outline-danger multi-select-back-btn' },
              'Close'
            ),
            Object.keys(multiSelectItem).length > 0 && multiSelectItem.countryCallingCodes.map(function (item) {
              return _react2.default.createElement(
                'button',
                {
                  key: item,
                  type: 'button',
                  onClick: function onClick() {
                    return _this8.selectCountry(multiSelectItem, false, item, true);
                  },
                  style: { position: 'relative', top: '50%', transform: 'perspective(1px) translateY(-50%)', marginLeft: 8, verticalAlign: 'middle' },
                  className: 'btn btn-secondary' },
                item
              );
            })
          )
        )
      );
    }
  }]);

  return IntlTelInput;
}(_react.Component);

exports.default = IntlTelInput;


IntlTelInput.defaultProps = {
  removeToken: _react2.default.createElement(
    'span',
    null,
    '\xD7'
  ),
  noResultsMessage: 'No results available',
  paginateText: 'Display additional results...',
  paginate: 50,
  placeholder: 'Search for a calling code by country name',
  maxHeight: 300,
  defaultCountry: 'US',
  disabled: false,
  minLengthMessage: 'Too short to be a valid phone number',
  maxLengthMessage: 'Too long to be a valid phone number',
  callingCodeMessage: 'Please select a valid country code',
  catchAllMessage: 'Not a valid phone number',
  validMessage: 'This phone number is valid',
  callingCodeDivider: _react2.default.createElement(
    'span',
    { style: { marginLeft: 4, marginRight: 4 } },
    '/'
  )
};

IntlTelInput.propTypes = {
  removeToken: _propTypes2.default.oneOfType([_propTypes2.default.element, _propTypes2.default.string]),
  preferredCountries: _propTypes2.default.arrayOf(_propTypes2.default.string),
  defaultValue: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.string]),
  noResultsMessage: _propTypes2.default.oneOfType([_propTypes2.default.element, _propTypes2.default.string]),
  paginateText: _propTypes2.default.oneOfType([_propTypes2.default.element, _propTypes2.default.string]),
  callingCodeDivider: _propTypes2.default.oneOfType([_propTypes2.default.element, _propTypes2.default.string]),
  paginate: _propTypes2.default.number,
  disabled: _propTypes2.default.bool,
  placeholder: _propTypes2.default.string,
  maxHeight: _propTypes2.default.number,
  defaultCountry: _propTypes2.default.string,
  onChange: _propTypes2.default.func,
  minLengthMessage: _propTypes2.default.string,
  maxLengthMessage: _propTypes2.default.string,
  callingCodeMessage: _propTypes2.default.string,
  catchAllMessage: _propTypes2.default.string,
  inputClassName: _propTypes2.default.string,
  validMessage: _propTypes2.default.string
};