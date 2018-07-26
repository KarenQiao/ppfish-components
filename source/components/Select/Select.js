import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Trigger from 'rc-trigger';
import scrollIntoView from 'dom-scroll-into-view';
import classNames from 'classnames';
import Button from '../Button/index.tsx';
import Spin from '../Spin/index.tsx';
import Icon from '../Icon/index.tsx';
import SelectSearch from './SelectSearch';
import {placements} from './placements';
import {KeyCode} from "../../utils";

const noop = () => {
};

export default class Select extends React.Component {
  static propTypes = {
    allowClear: PropTypes.bool,
    children: PropTypes.node,
    className: PropTypes.string,
    defaultActiveFirstOption: PropTypes.bool,
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array, PropTypes.object]),
    disabled: PropTypes.bool,
    dropdownClassName: PropTypes.string,
    dropdownMatchSelectWidth: PropTypes.bool,
    dropdownStyle: PropTypes.object,
    extraOptions: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    filterOption: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
    getPopupContainer: PropTypes.func,
    labelClear: PropTypes.bool,
    labelInValue: PropTypes.bool,
    loading: PropTypes.bool,
    maxScrollHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    mode: PropTypes.oneOf(['multiple', 'single']),
    notFoundContent: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    onChange: PropTypes.func,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onPopupScroll: PropTypes.func,
    onSearch: PropTypes.func,
    onSelect: PropTypes.func,
    onVisibleChange: PropTypes.func,
    placeholder: PropTypes.string,
    popupAlign: PropTypes.oneOf(['bottomLeft', 'bottom', 'bottomRight']),
    prefixCls: PropTypes.string,
    searchInputProps: PropTypes.object,
    searchPlaceholder: PropTypes.string,
    selectAllText: PropTypes.string,
    showArrow: PropTypes.bool,
    showSingleClear: PropTypes.bool,
    showSearch: PropTypes.bool,
    showSelectAll: PropTypes.bool,
    size: PropTypes.oneOf(['default', 'small', 'large']),
    style: PropTypes.object,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array, PropTypes.object]),
  };

  static defaultProps = {
    allowClear: true,
    defaultActiveFirstOption: false,
    disabled: false,
    dropdownMatchSelectWidth: true,
    filterOption: true,
    labelClear: false,
    labelInValue: false,
    loading: false,
    maxScrollHeight: 250,
    mode: 'single',
    notFoundContent: '无匹配结果',
    onChange: noop,
    onPopupScroll: noop,
    onSearch: noop,
    onSelect: noop,
    onVisibleChange: noop,
    placeholder: '请选择',
    popupAlign: 'bottomLeft',
    prefixCls: 'fishd-select',
    searchInputProps: {},
    searchPlaceholder: '请输入关键词',
    selectAllText: '选择所有',
    showArrow: true,
    showSearch: false,
    showSingleClear: false,
    showSelectAll: false,
    size: 'default',
    style: {},
  };

  constructor(props) {
    super(props);
    const {value, defaultValue, labelInValue} = this.props;
    this.state = {
      searchValue: '',
      selectValue: this.covertSelectValue(value || defaultValue, labelInValue),
      popupVisible: false,
      resetValue: [],
      activeKey: undefined,
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      this.setState({
        selectValue: this.covertSelectValue(nextProps.value, nextProps.labelInValue)
      });
    }
  }

  //搜索键入
  updateSearchValue = (e) => {
    this.setState({
      searchValue: e.target.value
    }, () => {
      this.props.onSearch(this.state.searchValue);
    });
  };

  //清空搜索
  emptySearchValue = () => {
    this.setState({
      searchValue: ''
    }, () => {
      this.props.onSearch(this.state.searchValue);
    });
  };

  //全选操作
  selectAll = () => {
    if (this.isSelectAll()) {
      this.setState({
        selectValue: [],
      });
    } else {
      this.setState({
        selectValue: this.getPlainOptionList(this.props.children, [], (child) => !child.props.disabled),
      });
    }
  };

  //转换传入的value
  covertSelectValue = (value, labelInValue) => {
    const valueType = Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
    const optionList = this.getPlainOptionList(this.props.children, []);
    if (labelInValue) {
      if (valueType === 'array') {
        return value && value.map(obj => {
          const label = obj.label || (optionList.find(option => option.key === obj.key) || {}).label || obj.key;
          return {
            key: obj.key,
            label: label
          };
        }) || [];
      } else if (valueType === 'object') {
        return [{
          key: value.key,
          label: value.label || (optionList.find(option => option.key === value.key) || {}).label || value.key
        }];
      } else {
        // 其余就给空状态
        return [];
      }
    } else {
      if (valueType === 'string' || valueType === 'number') value = [value];
      return value && value.map(key => {
        const label = (optionList.find(option => option.key === key) || {}).label || key;
        return {
          key: key,
          label: label
        };
      }) || [];
    }
  };

  //清空数据项,mode='single'
  emptySelectValue = () => {
    this.setState({
      selectValue: [],
      popupVisible: false,
    }, () => {
      this.props.onChange();
    });
  };

  //popup显示隐藏
  onVisibleChange = (visible) => {
    this.setState({
      popupVisible: visible
    }, () => {
      const {onVisibleChange, defaultActiveFirstOption} = this.props;
      onVisibleChange(visible);
      if (visible) {
        // 没有选中任何选项、默认开启激活第一个选项
        if (defaultActiveFirstOption && !this.state.selectValue.length) {
          const firstOption = this.getPlainOptionList(this.props.children, [], (child) => !child.props.disabled)[0] || {};
          this.setState({
            activeKey: firstOption.key
          });
        }
        //使框focus()
        this.focus();
      }
    });
  };

  //聚焦操作
  focus() {
    const {showSearch, loading} = this.props;
    if (loading) return;
    if (showSearch) {
      this.selectSearch.searchInput.input.focus();
    } else {
      this.selection.focus();
    }
  }

  //失焦操作
  blur() {
    const {showSearch, loading} = this.props;
    if (loading) return;
    if (showSearch) {
      this.selectSearch.searchInput.input.blur();
    } else {
      this.selection.blur();
    }
  }

  //处理 label、option的click操作
  onOptionClick = (e, obj, clickInLabel) => {
    e && e.stopPropagation();
    const {onChange, mode, onSelect, labelInValue} = this.props;
    const selectValue = this.state.selectValue;
    const index = selectValue.findIndex(selected => selected.key === obj.key);
    if (mode === 'single') {
      this.setState({
        selectValue: [obj],
        popupVisible: false,
      }, () => {
        if (labelInValue) {
          onChange(obj);
        } else {
          onChange(obj.key);
        }
      });
    } else if (mode === 'multiple') {
      if (index === -1) {
        this.setState({
          selectValue: [...selectValue, obj]
        });
      } else {
        this.setState({
          selectValue: [...selectValue.slice(0, index), ...selectValue.slice(index + 1)]
        }, () => {
          if (clickInLabel) {
            //Clicking on label will trigger the onchange event.
            if (labelInValue) {
              onChange(this.state.selectValue);
            } else {
              onChange(this.state.selectValue.map(selected => selected.key));
            }
          }
        });
      }
    }
    //fire onSelect event => option/label click
    onSelect(obj);
  };

  //获取列表待筛选操作
  getSelectOptionList = (children, dropdownCls) => {
    return React.Children.map(children, (c) => {
      if (typeof c === 'object' && c.type.isSelectOption) {
        const value = c.props.value || c.key;
        //对children中的Option 进行事件绑定、参数补充
        return React.cloneElement(c, {
          prefixCls: `${dropdownCls}-option`,
          checked: !!this.state.selectValue.find(obj => obj && obj.key === value),
          value: value,
          activeKey: this.state.activeKey,
          onOptionClick: this.onOptionClick,
          onOptionMouseEnter: this.onOptionMouseEnter,
          onOptionMouseLeave: this.onOptionMouseLeave,
          ref: value,
          children: this.getSelectOptionList(c.props.children, dropdownCls),
        });
      } else if (typeof c === 'object' && c.type.isSelectOptGroup) {
        return React.cloneElement(c, {
          prefixCls: `${dropdownCls}-option`,
          children: this.getSelectOptionList(c.props.children, dropdownCls),
        });
      } else {
        return children;
      }
    });
  };

  //获取筛选后列表
  getSelectFilteredOptionList = (children, ChildrenList = []) => {
    const {filterOption} = this.props;
    const {searchValue} = this.state;
    const typeOfOption = Object.prototype.toString.call(filterOption).slice(8, -1).toLowerCase();
    React.Children.forEach(children, child => {
      let filterFlag = false;
      if (child.type.isSelectOption) {
        if (typeOfOption === 'function') {
          filterFlag = filterOption(searchValue, child);
        } else if (typeOfOption === 'boolean') {
          filterFlag = filterOption;
        }
        if (filterFlag) {
          ChildrenList.push(child);
        }
      } else if (child.type.isSelectOptGroup) {
        const children = this.getSelectFilteredOptionList(child.props.children);
        ChildrenList.push(React.cloneElement(child, {
          children: children,
          _isShow: !!(children && children.length) //搜索后分组下没有东西就隐藏该分组
        }));
      }
    });

    return ChildrenList;
  };

  //获取所有option的[{label,key}]
  getPlainOptionList = (children, plainOptionList = [], filter) => {
    React.Children.forEach(children, (c) => {
      if (c.type.isSelectOption) {
        if (filter) {
          filter(c) && plainOptionList.push({label: c.props.children, key: c.props.value || c.key});
        } else {
          plainOptionList.push({label: c.props.children, key: c.props.value || c.key});
        }
      } else if (c.type.isSelectOptGroup) {
        this.getPlainOptionList(c.props.children, plainOptionList, filter);
      } else {
        //  其余暂时不做处理
      }
    });
    return plainOptionList;
  };

  //多选-取消
  handleCancelSelect = () => {
    const {defaultValue, value, labelInValue} = this.props;
    this.setState({
      popupVisible: false,
      selectValue: this.covertSelectValue(value || defaultValue || [], labelInValue)
    });
  };

  //多选-确定
  handleConfirmSelect = () => {
    const {onChange, labelInValue} = this.props;
    this.setState({
      popupVisible: false,
    }, () => {
      if (labelInValue) {
        onChange(this.state.selectValue);
      } else {
        onChange(this.state.selectValue.map(selected => selected.key));
      }
    });
  };

  //判断是否全选
  isSelectAll = () => {
    const optionlist = this.getPlainOptionList(this.props.children, [], (child) => !child.props.disabled);
    const selectedlist = this.state.selectValue;
    //全选判断逻辑：option中每一项都能在seleced中找到（兼容后端搜索的全选判断）
    return optionlist.every(selected => {
      return !!selectedlist.find(option => option.key === selected.key);
    });
  };

  //处理tab上下active切换功能
  handleActiveTabChange = (e) => {
    const keyCode = e.keyCode;
    if (keyCode === KeyCode.ENTER || keyCode === KeyCode.UP || keyCode === KeyCode.DOWN) {
      e.preventDefault();
      const {children, mode, labelInValue, onChange} = this.props;
      const {activeKey, selectValue} = this.state;
      const optionList = this.getPlainOptionList(children, [], (child) => !child.props.disabled);
      const optionListLen = optionList.length;
      if (!optionListLen) return;
      //enter
      if (keyCode === KeyCode.ENTER) {
        const activeTabIndex = optionList.findIndex(option => option.key === activeKey);
        // activeKey不在列表中
        if (activeTabIndex !== -1) {
          if (!selectValue.find((selected) => selected.key === activeKey)) {
            if (mode === 'single') {
              this.setState({
                selectValue: [optionList[activeTabIndex]],
                popupVisible: false,
                activeKey: undefined,
              }, () => {
                if (labelInValue) {
                  onChange(this.state.selectValue[0]);
                } else {
                  onChange(this.state.selectValue.map(selected => selected.key)[0]);
                }
              });
            } else if (mode === 'multiple') {
              this.setState({
                selectValue: [...selectValue, optionList[activeTabIndex]]
              });
            }
          }
        }
      }
      //38 up 40 down
      if (keyCode === KeyCode.UP || keyCode === KeyCode.DOWN) {
        // 有activeKey
        if (activeKey) {
          const activeTabIndex = optionList.findIndex(option => option.key === activeKey);
          // activeKey不在列表中
          if (activeTabIndex === -1) {
            this.setState({
              activeKey: optionList[0].key
            }, () => {
              this.setActiveOptionIntoView(optionList[0].key);
            });
            return;
          }
          // 上按钮
          let nextActiveKEY = undefined;
          if (keyCode === KeyCode.UP) {
            //超出到最后一个
            if (activeTabIndex === 0) {
              nextActiveKEY = optionList[optionListLen - 1].key;
            } else {
              nextActiveKEY = optionList[activeTabIndex - 1].key;
            }
          } else if (keyCode === KeyCode.DOWN) {
            if (activeTabIndex + 1 === optionListLen) {
              nextActiveKEY = optionList[0].key;
            } else {
              nextActiveKEY = optionList[activeTabIndex + 1].key;
            }
          }
          this.setState({
            activeKey: nextActiveKEY
          }, () => {
            this.setActiveOptionIntoView(nextActiveKEY);
          });
        } else {
          this.setState({
            activeKey: optionList[0].key
          }, () => {
            this.setActiveOptionIntoView(optionList[0].key);
          });
        }
      }
    }
  };

  //处理option的激活态
  setActiveOptionIntoView = (activeKey) => {
    scrollIntoView(ReactDOM.findDOMNode(this.refs[activeKey]), ReactDOM.findDOMNode(this.dropdownList), {
      onlyScrollIfNeeded: true,
    });
  };

  //处理option激活态-> mouseEnter
  onOptionMouseEnter = (activeKey) => {
    this.setState({activeKey});
  };

  //处理option激活态-> mouseLeave
  onOptionMouseLeave = () => {
    this.setState({activeKey: undefined});
  };

  //下拉框内容
  getDropdownPanel() {
    const {
      allowClear,
      children,
      dropdownClassName,
      dropdownStyle,
      extraOptions,
      loading,
      maxScrollHeight,
      mode,
      notFoundContent,
      onPopupScroll,
      placeholder,
      prefixCls,
      searchInputProps,
      searchPlaceholder,
      selectAllText,
      showSearch,
      showSelectAll,
      showSingleClear,
    } = this.props;
    const {searchValue} = this.state;
    const dropdownCls = `${prefixCls}-dropdown`;
    const optionFilteredList = this.getSelectFilteredOptionList(this.getSelectOptionList(children, dropdownCls)); //获取筛选后的列表
    const showNotFoundContent = !this.getPlainOptionList(optionFilteredList).length; // optionList为空判断
    return (
      <div className={classNames(dropdownCls, {[dropdownClassName]: !!dropdownClassName})}
           onKeyDown={this.handleActiveTabChange}
           ref={selection => this.selection = selection}
           style={dropdownStyle}
           tabIndex="0">
        {
          loading ?
            <div className={`${dropdownCls}-loading`}>
              <div><Spin size="small" style={{marginRight: 5}}/>加载中...</div>
            </div> :
            <div className={`${dropdownCls}-content`}>
              {
                //搜索框
                showSearch &&
                <SelectSearch
                  allowClear={allowClear}
                  emitEmpty={this.emptySearchValue}
                  prefixCls={`${dropdownCls}-search`}
                  ref={(selectSearch => this.selectSearch = selectSearch)}
                  searchInputProps={searchInputProps}
                  searchPlaceholder={searchPlaceholder}
                  searchValue={searchValue}
                  updateSearchValue={this.updateSearchValue}
                />
              }
              <div className={`${dropdownCls}-list`}
                   onScroll={onPopupScroll}
                   ref={dropdownList => this.dropdownList = dropdownList}
                   style={{maxHeight: maxScrollHeight}}>
                {
                  //全选按钮-多选的情况下存在
                  showSelectAll && mode === 'multiple' &&
                  <li
                    className={classNames({[`${dropdownCls}-option-item`]: true}, {['checked']: this.isSelectAll()})}
                    onClick={this.selectAll}>
                    {selectAllText}
                  </li>
                }
                {
                  //清空选项按钮-单选未搜索的情况下存在
                  !searchValue && showSingleClear && mode === 'single' &&
                  <li
                    className={`${dropdownCls}-option-item clear`}
                    onClick={this.emptySelectValue}>
                    {placeholder}
                  </li>
                }
                {
                  //预留置顶项
                  extraOptions
                }
                {
                  //列表及空状态框
                  showNotFoundContent ?
                    <div className={`${dropdownCls}-not-found`}>{notFoundContent}</div> :
                    <div className={`${dropdownCls}-filtered-list`}>{optionFilteredList}</div>
                }
              </div>
              {
                //多选的点击取消、确定按钮组
                mode === 'multiple' &&
                <div className={`${dropdownCls}-footer`}>
                  <Button size="large" className={`${dropdownCls}-footer-btn`}
                          onClick={this.handleCancelSelect}>取消</Button>
                  <Button size="large" className={`${dropdownCls}-footer-btn`} onClick={this.handleConfirmSelect}
                          type="primary">确定</Button>
                </div>
              }
            </div>
        }
      </div>
    );
  }

  // 获取面板内容
  getSelectionPanel() {
    const {
      className,
      disabled,
      labelClear,
      loading,
      mode,
      onMouseEnter,
      onMouseLeave,
      placeholder,
      prefixCls,
      showArrow,
      size,
      style
    } = this.props;
    const {selectValue, popupVisible} = this.state;
    const selectionCls = `${prefixCls}`;
    const selectionPanelCls =
      classNames(
        {[`${selectionCls}`]: true},
        {[className]: !!className},
        {[`${selectionCls}-disabled`]: disabled},
        {[`open`]: popupVisible},
        {[`${selectionCls}-large`]: size === 'large'},
        {[`${selectionCls}-small`]: size === 'small'},
      );
    return (
      <div
        className={selectionPanelCls}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={style}>
        {
          loading ?
            <div className={`${selectionCls}-loading`}>
              <div><Spin size="small" style={{marginRight: 5}}/>加载中...</div>
            </div> :
            <div className={`${selectionCls}-content`}>
              {
                //showArrow并且不是可删除label模式下出现箭头
                showArrow && !labelClear &&
                <div className={`${selectionCls}-caret`}>
                  <Icon type="xiajiantou" className={classNames({['open']: popupVisible})}/>
                </div>
              }
              {
                //没有值的情况下显示placeholder
                !selectValue.length &&
                <div unselectable="on" className={`${selectionCls}-placeholder`}>{placeholder}</div>
              }
              {
                //单选模式下有值显示值的label
                mode === 'single' && !!selectValue.length &&
                <span className={`${selectionCls}-option-single`}>{selectValue[0].label}</span>
              }
              {
                //多选模式下区分labelClear
                mode === 'multiple' && (
                  labelClear ?
                    <div className={`${selectionCls}-option-clearable-list`}>
                      {
                        selectValue.map(option =>
                            <div className={`${selectionCls}-option-clearable-option`} key={option.key}>
                              {option.label}
                              <span className={`${selectionCls}-option-clearable-option-close`}
                                    onClick={(e) => this.onOptionClick(e, option, true)}>
                        <Icon type="guanbi"/>
                      </span>
                            </div>
                        )
                      }
                    </div> :
                    <div className={`${selectionCls}-option-multiple`}>
                      {
                        selectValue.map((option, index) =>
                            <span key={option.key} className={`${selectionCls}-option-multiple-option`}>
                      <span>{option.label}</span>
                      <span>{index + 1 !== selectValue.length && '、'}</span>
                    </span>
                        )
                      }
                    </div>
                )
              }
            </div>
        }
      </div>
    );
  }

  render() {
    const {
      disabled,
      dropdownMatchSelectWidth,
      getPopupContainer,
      popupAlign,
      prefixCls,
    } = this.props;
    return (
      <Trigger
        action={disabled ? [] : ['click']}
        builtinPlacements={placements}
        forceRender
        getPopupContainer={getPopupContainer}
        onPopupVisibleChange={this.onVisibleChange}
        popup={this.getDropdownPanel()}
        popupPlacement={popupAlign}
        popupVisible={this.state.popupVisible}
        prefixCls={`${prefixCls}-popup`}
        stretch={dropdownMatchSelectWidth ? 'width height' : 'height'}
      >
        {this.getSelectionPanel()}
      </Trigger>
    );
  }
}
