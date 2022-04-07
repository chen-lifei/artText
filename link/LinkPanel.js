import Vue from 'vue';
import LinkPanel from './LinkPanel.vue';
let LinkPanelConstructor = Vue.extend(LinkPanel);
let linkPanelDestroy = null;
let mouseEvent = null;

export default {
    create(options = {}) {
        utils.isFunctionCall(linkPanelDestroy);
        let { target, documentInfo, pageList, linkParams = {}, edit, destroy } = options;
        let instance = new LinkPanelConstructor({
            data() {
                return {
                    linkParams: linkParams,
                    pageList: pageList,
                    documentInfo: documentInfo,
                    position: getPosition(target)
                }
            }
        });
        linkPanelDestroy = function() {
            instance.$el.removeEventListener('mouseout', mouseEvent);
            utils.isFunctionCall(destroy);
            document.body.removeChild(instance.$el);
            instance.$destroy();
            linkPanelDestroy = null;
        }

        function getPosition(target) {
            let position = { top: 0, left: 0 };
            let { height } = target.getBoundingClientRect();
            let offset = $(target).offset();
            position.left = `${offset.left}px`;
            position.top = `${offset.top + height + 4}px`;
            return position;
        }

        mouseEvent = function(event) {
            if (!instance.isEdit && !$(event.toElement).parents('.link-panel').length) linkPanelDestroy();
        }

        instance.$once(`edit`, (data) => {
            utils.isFunctionCall(edit, data);
            linkPanelDestroy();
        });
        instance.$once(`close`, () => {
            linkPanelDestroy();
        });
        instance.$mount();
        document.body.appendChild(instance.$el);

        instance.$el.addEventListener('mouseout', mouseEvent);
    },
    destroy() {
        utils.isFunctionCall(linkPanelDestroy);
    },
}