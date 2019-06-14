import React from 'react';
import { shallow } from 'enzyme';
import { colors } from 'styles';
import { Wrapper, ReactSmartSlider, RectangleThumb, Track, SecondWrapper } from './ReactSmartSlider';
const mockConfig = (device) => ({
    value: device,
    configurable: true
});
const agent = 'userAgent';
const renderImages = () => {
    const images = [
        'https://cdn.pixabay.com/photo/2019/06/02/00/46/chapel-4245437__340.jpg',
        'https://cdn.pixabay.com/photo/2017/08/22/22/36/cinque-terre-2670762__340.jpg',
        'https://cdn.pixabay.com/photo/2016/08/01/20/34/girl-1562091__340.jpg',
        'https://cdn.pixabay.com/photo/2013/09/26/23/23/glitter-powder-186829__340.jpg',
        'https://cdn.pixabay.com/photo/2019/04/11/09/50/wave-4119274__340.jpg'
    ];
    return images.map(image => (React.createElement("img", { src: image })));
};
const initialProps = {
    numCols: 1,
    spacing: 0,
    trackProps: {
        color: colors.secondary,
        height: 20
    },
    children: renderImages()
};
describe('ReactSmartSlider: lib/components', () => {
    it('should render itself', () => {
        const wrapper = shallow(React.createElement(ReactSmartSlider, Object.assign({}, initialProps)));
        expect(wrapper.find(Wrapper).exists()).toEqual(true);
        expect(wrapper.find(SecondWrapper).exists()).toEqual(true);
        expect(wrapper.find(RectangleThumb).exists()).toEqual(true);
        expect(wrapper.find(Track).exists()).toEqual(true);
    });
    it('should not render Scrollbar', () => {
        Object.defineProperty(window.navigator, agent, mockConfig('iPhone'));
        const wrapper = shallow(React.createElement(ReactSmartSlider, Object.assign({}, initialProps)));
        expect(wrapper.find(Track).exists()).toEqual(false);
        expect(wrapper.find(RectangleThumb).exists()).toEqual(false);
    });
    it('should invoke onOverflowContentScroll onScroll', () => {
        const onOverflowContentScrollSpy = jest.spyOn(ReactSmartSlider.prototype, 'onOverflowContentScroll');
        const wrapper = shallow(React.createElement(ReactSmartSlider, Object.assign({}, initialProps)));
        wrapper.find(SecondWrapper).simulate('scroll');
        expect(onOverflowContentScrollSpy).toHaveBeenCalled();
    });
    it('should invoke measureContainers onLoad', () => {
        const measureContainersSpy = jest.spyOn(ReactSmartSlider.prototype, 'measureContainers');
        const wrapper = shallow(React.createElement(ReactSmartSlider, Object.assign({}, initialProps)));
        wrapper.find(SecondWrapper).simulate('load');
        expect(measureContainersSpy).toHaveBeenCalled();
    });
    it('should invoke addEventListener', () => {
        window.addEventListener = jest.fn();
        shallow(React.createElement(ReactSmartSlider, Object.assign({}, initialProps)));
        expect(window.addEventListener).toHaveBeenCalled();
    });
    it('should invoke removeEventListener', () => {
        window.removeEventListener = jest.fn();
        const wrapper = shallow(React.createElement(ReactSmartSlider, Object.assign({}, initialProps)));
        wrapper.unmount();
        expect(window.removeEventListener).toHaveBeenCalled();
    });
    it('should invoke onMouseDown', () => {
        Object.defineProperty(window.navigator, agent, mockConfig('web'));
        const onMouseDownSpy = jest.spyOn(ReactSmartSlider.prototype, 'onMouseDown');
        const wrapper = shallow(React.createElement(ReactSmartSlider, Object.assign({}, initialProps)));
        const event = {
            preventDefault: jest.fn()
        };
        wrapper.find(RectangleThumb).simulate('mousedown', event);
        expect(onMouseDownSpy).toHaveBeenCalled();
    });
    it('should invoke onScrollbarClick after CustomScrollbar clicked', () => {
        ReactSmartSlider.prototype.onScrollbarClick = jest.fn();
        const onScrollbarClickSpy = jest.spyOn(ReactSmartSlider.prototype, 'onScrollbarClick');
        const wrapper = shallow(React.createElement(ReactSmartSlider, Object.assign({}, initialProps)));
        const event = {
            clientX: 123
        };
        wrapper.find(Track).simulate('click', event);
        expect(onScrollbarClickSpy).toHaveBeenCalled();
    });
    it('should set state after measureContainers invoked', () => {
        const wrapper = shallow(React.createElement(ReactSmartSlider, Object.assign({}, initialProps, { numCols: undefined })));
        const wrapperInstance = wrapper.instance();
        const getRefCurrent = (refName, refContent) => wrapperInstance[refName].current = refContent;
        const value = 100;
        const documentWidth = 1000;
        const trackHeight = 50;
        getRefCurrent('thumbRef', {
            clientWidth: value,
            clientHeight: value
        });
        getRefCurrent('overflowContainerRef', {
            children: [],
            clientWidth: documentWidth
        });
        getRefCurrent('trackRef', {
            clientHeight: trackHeight
        });
        wrapperInstance.measureContainers();
        expect(wrapper.state().thumbWidth).toEqual(value);
        expect(wrapper.state().thumbHeight).toEqual(value);
        expect(wrapper.state().trackHeight).toEqual(trackHeight);
        expect(wrapper.state().scrollContainerWidth).toEqual(documentWidth);
    });
    it('should change thumbRef after measureContainers invoked', () => {
        const wrapper = shallow(React.createElement(ReactSmartSlider, Object.assign({}, initialProps, { numCols: undefined })));
        const wrapperInstance = wrapper.instance();
        const getRefCurrent = (refName, refContent) => wrapperInstance[refName].current = refContent;
        const value = 100;
        const documentWidth = 500;
        const trackHeight = 50;
        const thumbOffsetLeft = 800;
        const overflownRef = 'overflowContainerRef';
        const thumbRef = 'thumbRef';
        getRefCurrent('thumbRef', {
            clientWidth: value,
            clientHeight: value,
            offsetLeft: thumbOffsetLeft,
            style: {
                left: 0
            }
        });
        getRefCurrent(overflownRef, {
            children: [],
            clientWidth: documentWidth,
            scroll: jest.fn()
        });
        getRefCurrent('trackRef', {
            clientHeight: trackHeight
        });
        wrapperInstance.measureContainers();
        expect(wrapperInstance[thumbRef].current.style.left).toEqual(`${documentWidth - value}px`);
    });
    it('should change state after onMouseDown', () => {
        const wrapper = shallow(React.createElement(ReactSmartSlider, Object.assign({}, initialProps, { numCols: undefined })));
        const wrapperInstance = wrapper.instance();
        const getRefCurrent = (refName, refContent) => wrapperInstance[refName].current = refContent;
        const offsetLeft = 50;
        const clientX = 100;
        const onMouseDownEvent = {
            clientX,
            preventDefault: jest.fn()
        };
        getRefCurrent('thumbRef', {
            offsetLeft
        });
        wrapper.find(RectangleThumb).simulate('mousedown', onMouseDownEvent);
        expect(wrapper.state().deltaXOrigin).toEqual(offsetLeft);
        expect(wrapper.state().deltaX).toEqual(clientX);
    });
    it('should set thumb left style', () => {
        const wrapper = shallow(React.createElement(ReactSmartSlider, Object.assign({}, initialProps, { numCols: undefined })));
        const wrapperInstance = wrapper.instance();
        const getRefCurrent = (refName, refContent) => wrapperInstance[refName].current = refContent;
        const clientX = 100;
        const state = {
            deltaX: 50,
            deltaXOrigin: 0,
            scrollContainerWidth: 500,
            thumbWidth: 100
        };
        const thumbRef = 'thumbRef';
        const onMouseDragEvent = {
            clientX
        };
        const offset = clientX - state.deltaX + state.deltaXOrigin;
        wrapper.setState(state);
        getRefCurrent('overflowContainerRef', {
            scroll: jest.fn(),
            getBoundingClientRect: jest.fn(() => ({ left: 0 }))
        });
        getRefCurrent('thumbRef', {
            style: {
                left: 0
            },
            clientWidth: 100
        });
        wrapperInstance.onMouseDrag(onMouseDragEvent);
        expect(wrapperInstance[thumbRef].current.style.left).toEqual(`${offset}px`);
        wrapperInstance.onMouseDrag({ clientX: -clientX });
        expect(wrapperInstance[thumbRef].current.style.left).toEqual(`${0}px`);
    });
    it('should set thumb left style when overflownScrollContent scrolled', () => {
        const wrapper = shallow(React.createElement(ReactSmartSlider, Object.assign({}, initialProps, { numCols: undefined })));
        const wrapperInstance = wrapper.instance();
        const getRefCurrent = (refName, refContent) => wrapperInstance[refName].current = refContent;
        const state = {
            scrollContainerWidth: 500,
            thumbWidth: 100
        };
        const scrollWidth = 1000;
        const clientWidth = 100;
        const scrollLeft = 50;
        const thumbRef = 'thumbRef';
        const maximumOffset = state.scrollContainerWidth - state.thumbWidth;
        const ratio = maximumOffset / (scrollWidth - clientWidth);
        getRefCurrent('overflowContainerRef', {
            scrollWidth,
            clientWidth,
            scrollLeft,
            children: []
        });
        getRefCurrent('thumbRef', {
            style: {
                left: scrollLeft
            }
        });
        wrapper.setState(state);
        wrapperInstance.onOverflowContentScroll();
        expect(wrapperInstance[thumbRef].current.style.left).toEqual(`${scrollLeft * ratio}px`);
    });
});