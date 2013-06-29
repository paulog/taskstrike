// Generated by CoffeeScript 1.6.2
(function() {
  jQuery(function($) {
    window.Tasks = Spine.Controller.create({
      tag: "li",
      proxied: ["render", "remove", "delete_userid", "save_order_of_list"],
      events: {
        "change   input[type=checkbox]": "toggle",
        "click    .destroy": "destroy",
        "dblclick .item": "edit",
        "click .item": "toggle_select",
        "keypress input[type=text]": "blurOnEnter"
      },
      elements: {
        "input.name": "input",
        ".item": "wrapper",
        ".duedate_field": "inputdate",
        "textarea.note": "textarea",
        ".user_selection": "user_selection",
        ".startdate": "start_date",
        ".enddate": "end_date"
      },
      delete_userid: function() {
        console.log(this);
        this.item.userid = null;
        this.item.save();
        return this.render;
      },
      bind_user: function() {
        if ((this.item.userid != null) && User.exists(this.item.userid)) {
          this.assignee = User.find(this.item.userid);
          this.assignee.bind("update", this.render);
          return this.assignee.bind("destroy", this.delete_userid);
        }
      },
      init: function() {
        this.item.bind("update", this.save_order_of_list);
        this.item.bind("update", this.render);
        window.taskdict[this.item.id] = this;
        this.item.bind("destroy", this.remove);
        return this.bind_user();
      },
      save_order_of_list: function() {
        var diff, previous, record;

        log("SAVE ORDER OF LIST");
        if (window.currently_syncing) {
          return true;
        }
        previous = this.item;
        record = Task.find(this.item.id);
        diff = Task.diff_objects(previous, record);
        log(record);
        log("DIFF", diff);
        if (diff["listid"] != null) {
          log("changed list id");
          Task.save_current_order_of_list(record.listid);
          Task.save_current_order_of_list(previous.listid);
          window.assign_parents(Task.list(record.listid).sort(Task.ordersort));
          return window.assign_parents(Task.list(previous.listid).sort(Task.ordersort));
        } else {
          if (diff["order"] || diff["parent"]) {
            log("calling assign parents");
          }
          Task.save_current_order_of_list(record.listid);
          return window.assign_parents(Task.list(record.listid).sort(Task.ordersort));
        }
      },
      render: function() {
        var elements;

        this.item = Task.find(this.item.id);
        elements = $("#taskTemplate").tmpl(this.item);
        this.el.html(elements);
        this.refreshElements();
        this.el.data("id", this.item.id);
        return this;
      },
      toggle: function() {
        this.item = Task.find(this.item.id);
        this.item.done = !this.item.done;
        this.item.time = moment().toString();
        return this.item.save();
      },
      destroy: function() {
        return this.item.destroy();
      },
      edit: function() {
        var _this = this;

        $("#dialog_task_name").val(this.item.name);
        $("#dialog_task_note").val(this.item.note);
        $("#dialog_task_status").val(this.item.status);
        if (this.item.start_date != null) {
          $("#dialog_task_startdate").val(this.item.start_date);
        }
        if (this.item.end_date != null) {
          $("#dialog_task_enddate").val(this.item.end_date);
        }
        if (this.item.priority != null) {
          $("#dialog_task_priority").val(this.item.priority);
        } else {
          $("#dialog_task_priority").val("0");
        }
        window.hide_based_on_user();
        $("#dialog_task").dialog({
          modal: true,
          title: "Edit Task",
          dialogClass: "adding",
          buttons: [
            {
              text: 'Save Task',
              id: 'dialog_task_save_btn',
              click: function() {
                var element;

                $("#dialog_task_name").blur();
                $("#dialog_task_note").blur();
                $("#dialog_task").dialog("close");
                _this.item.updateAttributes({
                  name: $("#dialog_task_name").val(),
                  time: moment().toString(),
                  note: $("#dialog_task_note").val(),
                  userid: $("#dialog_task_user_id").val(),
                  start_date: $("#dialog_task_startdate").val(),
                  end_date: $("#dialog_task_enddate").val(),
                  status: $("#dialog_task_status").val(),
                  priority: $("#dialog_task_priority").val()
                });
                if ($(".selected").attr("id") === "views_tab") {
                  _this.el.addClass("task_selected");
                }
                element = _this.el;
                $("li").each(function(idx, value) {
                  if ($(value).data("id") === $(element).data("id")) {
                    return window.cur = idx;
                  }
                });
                window.last_opened = "";
                return _this.bind_user();
              }
            }
          ],
          beforeClose: function() {
            $("#dialog_task_name").blur();
            return $("#dialog_task_note").blur();
          },
          open: function() {
            var user, _i, _len, _ref;

            $('#dialog_task_user_id').html("");
            $('#dialog_task_user_id').append("<option value=''></option>");
            _ref = User.all();
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              user = _ref[_i];
              $('#dialog_task_user_id').append("<option value='" + user.id + "'>" + user.name + "</option>");
            }
            $("#dialog_task_user_id").val(_this.item.userid);
            return window.hide_based_on_user();
          }
        });
        return $("#dialog_task_name").focus();
        /*
        if @wrapper.hasClass "editing"
          return
        
        if @el.hasClass "task_selected"
          @el.removeClass "task_selected"
        
        if window.last_opened isnt ""
          window.taskdict[window.last_opened].close()
        window.last_opened = @item.id
        
        @wrapper.addClass "editing"
        @input.focus()
        
        user = @user_selection
        
        $.each User.all(), (key, value) ->
          user.append('<option value="'+value.id+'">'+value.name+'</option>')
        
        $( @user_selection ).val(@item.userid)
        */

      },
      blurOnEnter: function(e) {
        if (e.keyCode === 13) {
          return e.target.blur();
        }
      },
      toggle_select: function() {
        var element;

        if (this.wrapper.hasClass("editing")) {
          return;
        }
        if (window.last_opened !== "") {
          window.taskdict[window.last_opened].close();
        }
        window.last_opened = "";
        $(".task_selected").removeClass("task_selected");
        element = this.el;
        $("li").each(function(idx, value) {
          if ($(value).data("id") === $(element).data("id")) {
            return window.cur = idx;
          }
        });
        return this.el.addClass("task_selected");
      },
      remove: function() {
        var record, x, _i, _len, _ref;

        record = this.item;
        log("removing record", record);
        if (record.order === 0) {
          _ref = Task.find_task_by_parent_id(record.id);
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            x = _ref[_i];
            window.currently_syncing = true;
            x.level = Number(x.level) - 1;
            x.save();
            window.currently_syncing = false;
          }
        }
        Task.save_current_order_of_list(record.listid);
        window.assign_parents(Task.list(record.listid).sort(Task.ordersort));
        return this.el.remove();
      }
    });
    window.TaskApp = Spine.Controller.create({
      tag: "div",
      proxied: ["addAll", "render", "renderCount", "remove", "attach"],
      events: {
        "click  .clear": "clear",
        "click  a.add": "addOne",
        "click  .deletelist": "deletelist",
        "click  .editlist": "editlist",
        "submit form.addform": "create_new",
        "click .peoplesort": "peoplesort",
        "click .startsort": "startsort",
        "click .endsort": "endsort",
        "click .statussort": "statussort",
        "click .prioritysort": "prioritysort"
      },
      elements: {
        ".items": "items",
        ".countVal": "count",
        ".clear": "clear",
        ".add": "add",
        ".addinputs .addtasks": "input",
        ".addinputs": "addform"
      },
      init: function() {
        this.item.bind("update", this.render);
        this.item.bind("update", this.attach);
        this.item.bind("destroy", this.remove);
        return Task.bind("change", this.renderCount);
      },
      sort: function() {
        return alert("test");
      },
      peoplesort: function() {
        Task.list_sort_by(this.item.id, "userid", false);
        window.assign_order(Task.list(this.item.id));
        return List.find(this.item.id).save();
      },
      startsort: function() {
        Task.list_sort_by(this.item.id, "start_date", false);
        window.assign_order(Task.list(this.item.id));
        return List.find(this.item.id).save();
      },
      endsort: function() {
        Task.list_sort_by(this.item.id, "end_date", false);
        window.assign_order(Task.list(this.item.id));
        return List.find(this.item.id).save();
      },
      statussort: function() {
        Task.list_sort_by(this.item.id, "status", true);
        window.assign_order(Task.list(this.item.id));
        return List.find(this.item.id).save();
      },
      prioritysort: function() {
        Task.list_sort_by(this.item.id, "priority", true);
        window.assign_order(Task.list(this.item.id));
        return List.find(this.item.id).save();
      },
      addAll: function() {
        var a, ordered;

        ordered = Task.list(this.item.id).sort(Task.ordersort);
        a = this.el;
        return $.each(ordered, function(key, value) {
          var view;

          view = Tasks.init({
            item: value
          });
          return a.find(".items").append(view.render().el);
        });
      },
      render: function() {
        var elements, tab_el, tab_html, tab_id, this_element, this_tab;

        this.item = List.find(this.item.id);
        elements = $("#listTemplate").tmpl(this.item);
        this.el.html(elements);
        this.refreshElements();
        this.el.data("id", this.item.id);
        this.addAll();
        if (this.item.id === "@default") {
          this.el.addClass("firstlist");
        }
        this.renderCount();
        tab_el = $(".listfilter");
        tab_id = "l" + (String(this.item.id).replace("@", ""));
        $("#" + tab_id).remove();
        tab_html = "<button id='" + tab_id + "'>" + this.item.name + "</button>";
        tab_el.prepend(tab_html);
        this.tab = $(String("#" + tab_id));
        this_element = "#" + this.item.id;
        this_tab = this.tab;
        this.tab.click(function() {
          $(".listdiv").hide();
          if (this_element === "#@default") {
            $(".firstlist .listdiv").show();
          } else {
            $(this_element).show();
          }
          $(".filterselected").removeClass("filterselected");
          return this_tab.addClass("filterselected");
        });
        return this;
      },
      renderCount: function() {
        var active, inactive;

        active = Task.active(this.item.id).length;
        this.count.text(active);
        return inactive = Task.done(this.item.id).length;
      },
      clear: function() {
        return Task.logDone(this.item.id);
      },
      addOne: function() {
        var new_task, view;

        new_task = Task.create({
          name: "",
          time: moment().toString(),
          done: false,
          order: Task.all().length + 1,
          synced: false,
          listid: this.item.id,
          parent_id: ""
        });
        view = Tasks.init({
          item: new_task
        });
        this.items.append(view.render().el);
        return view.edit();
      },
      deletelist: function() {
        var current_item;

        current_item = this.item;
        return $("#dialog_confirmdelete").dialog({
          modal: true,
          title: 'Delete the list',
          buttons: {
            'Yes': function() {
              var task, _i, _len, _ref;

              $("#dialog_confirmdelete").dialog("close");
              _ref = Task.list(current_item.id);
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                task = _ref[_i];
                task.destroy();
              }
              return current_item.destroy();
            },
            'No': function() {
              return $("#dialog_confirmdelete").dialog("close");
            }
          }
        });
      },
      create_new: function() {
        var input_value, new_task, view;

        input_value = this.input.val().replace("'", "''");
        new_task = Task.create({
          name: input_value,
          time: moment().toString(),
          done: false,
          order: Task.list(this.item.id).length + 1,
          listid: this.item.id,
          parent_id: ""
        });
        view = Tasks.init({
          item: new_task
        });
        this.items.append(view.render().el);
        this.input.val("");
        return false;
      },
      remove: function() {
        this.el.remove();
        return this.tab.remove();
      },
      editlist: function() {
        var d;

        $("#list_name").val(this.item.name);
        $("#list_description").val(this.item.description);
        d = $("#dialog_addlist").dialog({
          modal: true,
          title: "Edit this list",
          dialogClass: "editing",
          buttons: {
            'Edit List': function() {
              edit_list();
              return $(this).dialog("close");
            }
          }
        });
        return d.data("id", this.item.id);
      },
      attach: function() {
        this.el.find(".roundedlist").sortable({
          stop: function(event, ui) {
            var current, current_list_id, id;

            window.ui = ui;
            id = ui.item.find(".id").attr("value");
            current = Task.find(id);
            current_list_id = window.ui.item.parent().attr("id").split("_")[0];
            log("dragged and dropped", current.name);
            current.listid = current_list_id;
            current.order = ui.item.index();
            current.time = moment().toString();
            return current.save();
          },
          connectWith: ".connectedsortable"
        });
        this.el.find(".addinputs").toggle();
        this.el.find(".addtoggle").click(function(event) {
          var clicked;

          clicked = $(this);
          clicked.toggle();
          clicked.parent().children(".addinputs").toggle();
          return clicked.parent().find(".addinputs .addtasks").focus();
        });
        return this.el.find(".doneadding").click(function(event) {
          var clicked;

          clicked = $(this);
          clicked.parent().parent().children(".addtoggle").toggle();
          return clicked.parent().toggle();
        });
      }
    });
    return window.allLists = Spine.Controller.create({
      el: $("#listsoftasks"),
      proxied: ["render"],
      init: function() {
        return this.render();
      },
      render: function() {
        var cur_el, lists;

        lists = List.all();
        cur_el = this.el;
        return $.each(lists, function(key, value) {
          var list;

          list = TaskApp.init({
            item: value
          });
          cur_el.append(list.render().el);
          return list.attach();
        });
      },
      render_new: function(item) {
        var list;

        list = TaskApp.init({
          item: item
        });
        this.el.append(list.render().el);
        return list.attach();
      }
    });
  });

}).call(this);
