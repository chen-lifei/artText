import Vue from 'vue';
import LinkPanel from './LinkPanel.vue';
let LinkPanelConstructor = Vue.extend(LinkPanel);
let linkPanelDestroy = null;
let mouseEvent = null;

export default {
    create(options = {}) {
        utils.isFunctionCall(linkPanelDestroy);
        let { target, documentInfo, pageList, isEdit = false, linkParams = {}, edit = null, openEditPanel = null, remove = null, destroy = null, changePage = null } = options;
        let instance = new LinkPanelConstructor({
            data() {
                return {
                    isEdit: isEdit,
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
            if (target) {
                let position = { top: 0, left: 0 };
                let { height } = target.getBoundingClientRect();
                let offset = $(target).offset();
                position.left = `${offset.left}px`;
                position.top = `${offset.top + height + 4}px`;
                return position;
            }

            if (document.querySelector('.link-panel')) {
                let windowWidth = window.innerWidth || document.body.clientWidth;
                let windowHeight = window.innerHeight || document.body.clientHeight;
                let panel = $('.link-panel');
                let panelWidth = panel.width();
                let panelHeight = instance.isEdit ? panel.height() + 150 : panel.height();
                let { top, left } = instance.position;
                top = Number(top.replace('px', ''));
                left = Number(left.replace('px', ''));

                if (top + panelHeight >= windowHeight) top = windowHeight - panelHeight;
                if (left + panelWidth >= windowWidth) left = windowWidth - panelWidth;
                instance.position =  { top: `${top}px`, left: `${left}px` };
            }
        }

        mouseEvent = function(event) {
            if (!instance.isEdit && !$(event.toElement).parents('.link-panel').length) linkPanelDestroy();
        }

        instance.$once(`edit`, (data) => {
            utils.isFunctionCall(edit, data);
            linkPanelDestroy();
        });
        instance.$once(`openEditPanel`, () => {
            setTimeout(() => {
                getPosition();
                utils.isFunctionCall(openEditPanel);
            }, 200);
        });
        instance.$once(`changePage`, (page) => {
            utils.isFunctionCall(changePage, page);
            linkPanelDestroy();
        });
        instance.$once(`remove`, () => {
            utils.isFunctionCall(remove);
            linkPanelDestroy();
        });
        instance.$once(`close`, () => {
            linkPanelDestroy();
        });
        instance.$mount();
        document.body.appendChild(instance.$el);

        getPosition();
        instance.$el.addEventListener('mouseout', mouseEvent);
    },
    destroy() {
        utils.isFunctionCall(linkPanelDestroy);
    },
}