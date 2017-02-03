(function(){
	//文集分类
	var $new_class = $('#new-class');
	var $content = $new_class.find('.content');
	var $newArticleClass = $('#new-article-class');

	//选择分类
	var $class_li = $new_class.find('.content>li');
	$class_li.eq(0).addClass('on');
	$new_class.on('click', '.content>li',function(){
		$(this).addClass('on');
		$class_li.not(this).removeClass('on').find('.set-up').hide();
	});

	//设置小图标  显示列表
	var $set_up = $new_class.find('.set-up');
	$new_class.on('click', '.set-nav', function(){
		$(this).next().toggle();
		$(this).next().css('top', parseInt($(this).css('height')) + parseInt($(this).css('top')) + 10);
		$set_up.not($(this).next()).hide();
	});
	$(document).on('click', function(){
		$set_up.hide();
	});

	$('#new-class-btn').click(function(){
		$newArticleClass.toggle(300);
	});

	$newArticleClass.find('.cancel').on('click', function(){
		$newArticleClass.hide(300);
	});

	//新增分类
	$newArticleClass.find('.confirm').on('click', function(){
		$.ajax({
			url : '/article/newArticleClass',
			type : 'post',
			data : {
				notebookName : $newArticleClass.find('.notebook-name').val()
			},
			success : function(data){
				if (data.success === true) {
					$content.append(`<li data-id="${data.id}">
														<span>${data.className}</span>
														<div class="set-nav"></div>
														<ul class="set-up">
															<li class="modify-article-class">修改文集名</li>
															<li class="divider"></li>
															<li class="delete-article-class">删除文集</li>
														</ul>
													</li>`);
					$set_up = $new_class.find('.set-up');
					$class_li = $new_class.find('.content>li');
					$newArticleClass.hide(300);
				} else {
					alert('数据上传错误！');
				}
			},
			error : function(err){
				alert('数据上传错误！');
			}
		});
	});

	$new_class.on('click', 'li',function(){
		return false;
	});

	//修改分类名
	var SelectedLi;
	$new_class.on('click', '.modify-article-class', function(){
		$popup_window.show().find('.text').focus();
		SelectedLi = $(this).parents('li')[0];
	});

	var $popup_window = $('#popup-window');
	$popup_window.find('.cancel').on('click', function(){
		$popup_window.hide();
	});

	$popup_window.find('.confirm').on('click', function(){
		$.ajax({
			url : '/article/changeArticleClassName',
			type : 'post',
			data : {
				classId : $content[0].dataset.id,
				articleId : SelectedLi.dataset.id,
				value : $popup_window.find('.text').val()
			},
			success : function(data){
				if (data.success) {
					$(SelectedLi).find('span').html(data.value);
					$popup_window.hide();
				} else {
					alert('服务器更新失败！');
				}
			},
			err : function(){
				alert('服务器出现错误！');
			}
		});
	});

	//删除分类
	$new_class.on('click', '.delete-article-class', function(){
		$set_up.hide();
		var $li = $(this).parents('li');
		$.ajax({
			url : '/article/deleteArticleClassName',
			type : 'delete',
			data : {
				classId : $content[0].dataset.id,
				articleId : $li[0].dataset.id,
			},
			success : function(data){
				if (data.success) {
					$li.remove();
					$new_class.find('.content>li').eq(0).addClass('on');
				} else {
					alert('删除失败服务器出现错误！');
				}
			},
			error : function(){
				alert('服务器出现错误！');
			}
		})
	});
})();

(function(){
	//文章分类
	var $new_article = $('#new-article');
	var $article = $('#article');
	var $content = $new_article.find('.content');
	var $title = $('#title');
	var $article_area = $('#article-area');

	var $article_li = $content.children('li');
	$article_li.eq(0).addClass('on').find('.article-introduction').text($article_area.text().substring(0, 50));
	$new_article.on('click', '.content>li', function(){
		saveArticle($article, $title, $article_area);
		var This = this;
		$.ajax({
			url : '/article/getTheArticle',
			type : 'post',
			data : {
				articleId : this.dataset.id
			},
			success : function(data){
				if (data.success) {
					$article_li = $content.children('li');
					var article = data.article;
					$title.val(article.title);
					$article_area.html(article.content);
					$article[0].dataset.id = This.dataset.id;
					$(This).addClass('on').find('h4').text(article.title);
					$(This).find('.article-introduction').text(Transformation(article.content.replace(/<.+?>/g, '')).substring(0, 50));
					$article_li.not(This).removeClass('on').find('.set-up').hide();
				} else {
					alert('文章获取错误！');
				}
			},
			error : function(){
				alert('服务器出现错误！');
			}
		});
		return false;
	});

	function Transformation(str){
		return str.replace(/&nbsp;|&lt;|&gt;/g, function(str){
			switch (str) {
				case '&nbsp;':
					return ' ';
				break;
				case '&lt;':
					return '<';
				break;
				case '&gt;':
					return '>';
				break;
			}
		});
	};

	//设置小图标  显示列表
	var $set_up = $new_article.find('.set-up');
	$new_article.on('click', '.set-nav', function(){
		$(this).next().toggle();
		$(this).next().css('top', parseInt($(this).css('height')) + parseInt($(this).css('top')) + 10);
		$set_up.not($(this).next()).hide();
	});

	$(document).on('click', function(){
		$set_up.hide();
	});

	//新建一篇文章
	$('#new-article-page').on('click', newArticle);
	$('#new-article-page-2').on('click', function(){newArticle.call($('#new-article-page')[0])});
	function newArticle(){
		$.ajax({
			url : '/article/newArticle',
			type : 'post',
			data : {
				id : this.dataset.id,
				classId : this.dataset.classId
			},
			success : function(data){
				if (data.success) {
					$new_article.find('.content').append(`<li data-id="${data.article._id}">
															<h4>${data.article.title}</h4>
															<p class="article-introduction">${data.article.content}</p>
															<div class="number">字数:0</div>
															<div class="set-nav"></div>
															<ul class="set-up">
																<li>直接发布</li>
																<li class="divider"></li>
																<li>移动文章</li>
																<li>历史版本</li>
																<li class="divider"></li>
																<li class="delete-article">删除文章</li>
															</ul>
														</li>`);
					$set_up = $new_article.find('.set-up');
				} else {
					alert('新增文章失败！');
				}
			},
			error : function(){
				alert('服务器出现错误！')
			}
		});
	}

	//删除一篇文章
	$content.on('click', '.delete-article', function(){
		var $li = $(this).parents('li');
		$.ajax({
			url : '/article/deleteArticle',
			type : 'delete',
			data : {
				id : $content[0].dataset.id,
				classId : $content[0].dataset.classId,
				articleId : $li[0].dataset.id
			},
			success : function(data){
				if (data.success) {
					$li.remove();
					alert('删除成功！');
				} else {
					alert('删除失败！');
				}
			},
			error : function(){
				alert('服务器出现错误！')
			}
		});
	});
})();


//封装document.execCommand  之后都会用到
function execCommand(type, options, Boolean){
	Boolean = Boolean || false;
	//调用document.execCommand 这个函数中的效果  具体类型自行百度
	//https://developer.mozilla.org/zh-CN/docs/Web/API/Document/execCommand#语法
	document.execCommand(type, Boolean, options);
};

//文本编辑器
(function(){
	//菜单栏出现的提示小按钮
	$('#article li').hover(function(){
		var div = $('<div class="display-attr">'+this.dataset.originalTitle+'</div>');
		$(this).append(div);
		var $display_attr = $(this).find('.display-attr');
		$display_attr.css('margin-left', -$display_attr.outerWidth()/2);
	}, function(){
		$('#article .display-attr').remove();
	});

	//让左边标题同步右边标题
	var timer = null;
	$('#title').on('input', function(){
		clearTimeout(timer);
		timer = setTimeout(() => {
			$('#new-article li.on h4').text(this.value);
		}, 300);
	});

	//让左边内容同步右边内容
	var timer2 = null;
	$('#article-area').on('input', function(){
		clearTimeout(timer2);
		timer2 = setTimeout(() => {
			var text = $(this).text();
			$('#new-article li.on .article-introduction').text(text.substring(0, 50));
			$('#new-article li.on .number').text(text.replace(/\s/g, '').length);
		}, 500);
	});

	//如果输入的时候没有任何内容就添加一个div标签进去
	$('#article-area').on('keyup', function(ev){
		if (!$(this).html()) {
			$(this).append('<div><br></div>');
		}
		if (ev.keyCode === 13) {
			//获取当前光标所在位置的父节点
			var currNode = window.getSelection().anchorNode.parentNode;
			console.log(currNode)
			if ($(currNode).attr('id') === 'article-area') {
				execCommand('FormatBlock', 'div');
				return false;
			}
		}
	});
})();

(function(){
	//设置文本编辑器点击该触发的事件
	var string;
	$('#article .left li').on('mousedown', function(){
		//保存鼠标选中到的字符串
		string = window.getSelection().toString();

		//createLink 插入链接 insertImage插入图片特殊处理
		var effect = this.dataset.effect;
		if (effect === 'createLink' || effect === 'insertImage') {
			//经行特殊处理
			if (effect === 'createLink') {
				try {
					var span = document.createElement("span");
					span.className = '_test';
					window.getSelection().getRangeAt(0).surroundContents(span);
				} catch (error) {
					execCommand('insertHTML', '<span class="_test">'+string+'</span>');
				}
			} else {
				execCommand('insertHTML', '<span class="_test"></span>');
			}
			$('#' + this.dataset.open).show().find('.model-text').val(string);
		} else {
			//直接执行修改操作
			execCommand(effect, this.dataset.options);
		}
		return false;
	});
})();

(function(){
	//点击左边该展示的特效

	//添加a标签
	function addSelection() {
		//获取包裹的元素
		var $wrap = $('#article-area ._test');
		var wrap = $wrap[0];
		//创建一个范围对象
		//http://www.w3school.com.cn/xmldom/dom_range.asp
		var range = document.createRange();
		try {
			//当此处发生错误的时候就代表wrap.firstChild  wrap没有内容
			//设置开始位置  //参数 
					//1. 节点 .firstChild 必须加 
					//2. 偏移量
			range.setStart(wrap.firstChild, 0);
			//设置结束位置  //参数 
					//1. 节点 .firstChild 必须加 
					//2. 偏移量
			range.setEnd(wrap.firstChild, wrap.innerText.length);
		} catch (e) {
			range.setStart(wrap, 0);
			range.setEnd(wrap, 0);
		}
		
		//清空所有选择的范围
		window.getSelection().removeAllRanges();
		//让页面选中 range设置的选区
		window.getSelection().addRange(range);
	}

	var $link_model = $('#link-model');
	var $link_model_link = $('.model-link');
	$link_model.find('.confirm').on('mousedown', function(){
		$(this).parent().hide();
		addSelection();
		execCommand('insertHTML', '<a href="'+$link_model.find('.model-link').val()+'">'+$link_model.find('.model-text').val()+'</a>');
		$link_model_link.val('http://');
	});

	$link_model.find('.cancel').on('click', function(){
		$(this).parent().hide();
		//清除包裹
		var $wrap = $('#article-area ._test');
		$wrap.replaceWith(string);
		$link_model_link.val('http://');
	});




	//添加img标签
	var $pic_model = $('#pic-model');
	var $upload_image = $('#upload-image');

	$pic_model.find('.tab-btn span').on('click', function(){
		var aggregate = $pic_model.find('.upload-image').add($pic_model.find('.link-image'));
		var _class = '.' + this.dataset.class;
		aggregate.filter(_class).show();
		aggregate.not(_class).hide();
	});

	function removeFileContent(){
		//清空file选中的文件
		var file = $upload_image[0];
		// for IE, Opera, Safari, Chrome
		if (file.outerHTML) {
			file.outerHTML = file.outerHTML;
		} else { // FF(包括3.5)
			file.value = "";
		}
	};

	$pic_model.find('.cancel').on('click', function(){
		$pic_model.hide();
	});

	$upload_image.on('change', function(){
	//使用html5中FormData对象
	//https://developer.mozilla.org/zh-CN/docs/Web/API/FormData
	var formData = new FormData();
	//获取上传的文件列表
	var files = $('#upload-image')[0].files;
	//将文件放入formData对象
	for (var i=0; i<files.length; i++) {
		//pic等于input中的name  files就代表value
		formData.append('pic', files[i]);
	}


	$.ajax({
		url: "/article/uploadImage",
		type: "POST",
		data: formData,
		//必须false才会自动加上正确的Content-Type
		contentType: false,
		//必须false才会避开jQuery对 formdata 的默认处理
		//XMLHttpRequest会对 formdata 进行正确的处理
		processData: false,
		success: function (data) {
			if (data.success === true) {
				var str = '';
				data.picSrc.forEach(function(curr, i){
					str += '<img src="'+curr.split('public')[1]+'">';
				});
				$('#article-area ._test').replaceWith(str);
				alert("上传成功！");
			} else {
				alert('上传失败！ 文件类型错误');
			}
		},
		error: function () {
			alert("上传失败！请不要超过1MB");
		}
	});

		removeFileContent();
	});

	$pic_model.find('.confirm').on('click', function(){
		var $pic_link = $('#pic-link');
		var val = $pic_link.val();

		if (val) {
			if (/^https:/g.test(val)) {
				alert('暂时不支持这种格式!');
			} else {
				$.ajax({
					url : '/article/servertoGetPic',
					type : 'post',
					data : {src : val},
					success : function(data){
						if (data.success) {
							$('#article-area ._test').replaceWith('<img src="'+data.information+'">');
							alert('图片获取成功！')
						} else {
							$('#article-area ._test').replaceWith(string);
							alert(data.information);
						}
					},
					error : function(){
						$('#article-area ._test').replaceWith(string);
					}
				})
			}
		}

		$pic_model.hide();
	});
})();

function saveArticle(article, title, content){
	$.ajax({
		url : '/article/saveArticle',
		type : 'post',
		data : {
			articleId : article[0].dataset.id,
			title : title.val(),
			content : content.html()
		},
		success : function(data){
			if (data.success) {
				alert('保存成功！');
			} else {
				alert('保存失败！');
			}
		},
		error : function(){
			alert('服务器出现错误！');
		}
	});
}

(function(){
	var $article = $('#article');
	var $title = $('#title');
	var $content = $('#article-area');
	//右侧功能实现
	$article.find('.right li').on('click', function(){
		switch (this.dataset.function) {
			case 'save':
				//保存文章
				saveArticle($article, $title, $content)
			break;
			case 'full-screen':
			
			break;
			case 'publish':
				//发布文章
				var This = this;
				var onOff;
				if (this.dataset.publish === 'true') {
					onOff = false;
				} else {
					onOff = true;
				}
				$.ajax({
					url : '/article/publishArticle',
					type : 'post',
					data : {
						articleId : $article[0].dataset.id,
						Boolean : onOff
					},
					success : function(data){
						if (data.success) {
							var on = onOff;
							if (on) {
								alert('发布成功！');
							} else {
								alert('以取消发布！');
							}
							This.dataset.publish = onOff;
							delete This;
							delete onOff;
						} else {
							alert('发布失败！');
						}
					},
					error : function(){
						alert('服务器出现错误！');
					}
				});
			break;
		};
	});
})();