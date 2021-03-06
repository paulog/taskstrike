// Generated by CoffeeScript 1.6.2
(function() {
  var exports, make_child, nextItem, open_for_edit, pressed_delete, prevItem, recurse_through_children, untab, updateItems;

  nextItem = function() {
    if ($("textarea:focus").length === 0 && $("input:focus").length === 0) {
      if (cur < ($("li").length - 1)) {
        window.cur++;
      } else {
        window.cur = 0;
      }
      updateItems();
    }
    return true;
  };

  prevItem = function() {
    if ($("textarea:focus").length === 0 && $("input:focus").length === 0) {
      if (cur > 0) {
        window.cur--;
      } else {
        window.cur = $("li").length - 1;
      }
      updateItems();
    }
    return true;
  };

  updateItems = function() {
    $("li.task_selected").removeClass("task_selected");
    return $("li:eq(" + cur + ")").addClass("task_selected");
  };

  open_for_edit = function(e) {
    var task_controller;

    if (e.target.className !== 'addtasks') {
      if ($("#dialog_task").dialog("isOpen") === true) {
        return $("#dialog_task_save_btn").click();
      } else {
        task_controller = window.taskdict[$(".task_selected").data("id")];
        task_controller.edit();
        return true;
      }
    } else {
      return $(e.target).parent().submit();
    }
  };

  pressed_delete = function() {
    var current, r, task_controller;

    r = confirm("Are you sure you want to delete this task?");
    if ($("textarea:focus").length === 0 && $("input:focus").length === 0) {
      if (r) {
        current = Task.find($(".task_selected").data("id"));
        task_controller = window.taskdict[$(".task_selected").data("id")];
        return task_controller.destroy();
      }
    }
  };

  make_child = function() {
    var current, task_controller;

    if ($("textarea:focus").length === 0 && $("input:focus").length === 0) {
      current = Task.find($(".task_selected").data("id"));
      task_controller = window.taskdict[$(".task_selected").data("id")];
      if (task_controller.el.index() === 0) {
        alert("The first task cannot be made into a child");
        return;
      } else {
        if (((current.parent_id != null) && current.parent_id !== "") && Task.find(current.parent_id).order === (current.order - 1)) {
          return;
        } else {
          if (current.level == null) {
            current.level = 0;
          }
          current.level = Number(current.level) + 1;
          current.time = moment().toString();
          current.save();
          window.assign_parents(Task.list(current.listid));
          $(task_controller.el).find(".item").addClass("child_" + current.level);
        }
      }
    }
    return true;
  };

  recurse_through_children = function(parent) {
    var child, children, _i, _len, _results;

    children = Task.find_task_by_parent_id(parent);
    log("CHILDREN", children);
    _results = [];
    for (_i = 0, _len = children.length; _i < _len; _i++) {
      child = children[_i];
      child.level = child.level - 1;
      child.time = moment().toString();
      child.save();
      _results.push(recurse_through_children(child.id));
    }
    return _results;
  };

  untab = function() {
    var current, task_controller;

    if ($("textarea:focus").length === 0 && $("input:focus").length === 0) {
      current = Task.find($(".task_selected").data("id"));
      task_controller = window.taskdict[$(".task_selected").data("id")];
      if (current.level === 0 || (current.level == null)) {
        return;
      } else {
        window.currently_syncing = true;
        current.level = current.level - 1;
        current.time = moment().toString();
        current.save();
        recurse_through_children(current.id);
        window.currently_syncing = false;
        window.assign_parents(Task.list(current.listid));
        $(task_controller.el).find(".item").addClass("child_" + current.level);
      }
    }
    return true;
  };

  exports = this;

  this.nextItem = nextItem;

  this.prevItem = prevItem;

  this.updateItems = updateItems;

  this.open_for_edit = open_for_edit;

  this.pressed_delete = pressed_delete;

  this.make_child = make_child;

  this.untab = untab;

}).call(this);
