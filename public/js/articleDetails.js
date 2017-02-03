(function(){
	var $header = $('#header');
	var $modal_backdrop;

	//左上角文章信息
	$header.find('.collection-menu-btn').add($header.find('.notebooks-menu-btn')).on('click', function(){
		var $div = $(this).children('div').show();
		$header.append('<div id="modal-backdrop"></div>');
		$header.find('#modal-backdrop').on('click', function(){
			$(this).remove();
			$div.hide();
			delete $div;
		});
	});

	$header.find('.collection-menu').add($header.find('.notebooks-menu')).on('click', function(){
		return false;
	});
	
})();
(function(){
	//判断是否登入
	function judgeUser(cb){
		if (!$('#navbar-user').find('.userDiv').length) {
			alert('请先登入！');
			window.location.href = '/user/signIn';
		} else {
			cb && cb();
		}
	}

	//发起评论
	var $body = $('#body');
	var $new_article = $('.new-article');
	var $comment = $('#comment');
	var $comment_content_wrap = $comment.find('.comment-content-wrap');
	$new_article.find('.btn').on('click', function(){
		judgeUser(() => {
			var This = this;
			var id = this.dataset.id;
			var data = {
				articleId : $body[0].dataset.articleId,
				content : $(this).parent().prev().val(),
			}
			if (id) {
				data.to = this.dataset.id;
				data.childCommentId = $(this).parents('.comment-content-list')[0].dataset.id;
			}
			$.ajax({
				url : '/article/comment',
				type : 'post',
				data : data,
				success : function(data){
					if (data.success) {
						if (id) {
							$(This).parents('.comment-content-list').find('.child-comment-list ul').append(`<li class="child-comment">
																				<p>
																					${data.comment.floor}楼
																					<a class="author-name" href="">${data.comment.own}</a>：
																					<a class="author-name" href="">${data.comment.to}</a>
																					${data.comment.content}
																				</p>
																				<p data-id="${data.comment.own}"> ${data.comment.time.createTime} <span class="reply">回复</span></p>
																			</li>`);
						} else {
							$comment_content_wrap.append(`<div class="comment-content-list" data-id="${data.comment._id}">
															<div class="meta-top">
																<a class="user-profile" href="">
																	<img src="/image/article/0.jpg" alt="">
																</a>
																<div>
																	<a class="author-name" href="${data.comment.own}">${data.comment.own}</a>
																	<p>${data.comment.floor} 楼 · ${data.comment.time.createTime}</p>
																</div>
															</div>
															<p>${data.comment.content}</p>
															<div class="comment-footer" data-id="${data.comment.own}">
																<span class="fabulous">喜欢(<i>${data.comment.fabulous}</i>)</span>
																<span class="reply">回复</span>
															</div>
															<div class="child-comment-list"><ul></ul></div>
															<div class="new-article">
																<textarea class="text" placeholder="写下你的评论…"></textarea>
																<div>
																	<span class="btn" data-id="${data.comment.own}">发表</span>
																</div>
															</div>
														</div>`);
						}
					} else {
						alert('评论失败！');
					}
				},
				error : function(){
					alert('评论失败！');
				}
			});
		});
		
	});

	//回复
	$comment.on('click', '.reply', function(){
		$(this)
			.parents('.comment-content-list')
			.find('.new-article')
			.slideToggle(300)
			.find('.text')
			.focus()
			.next()
			.find('.btn')[0].dataset.id = $(this).parent()[0].dataset.id;
	});

	//赞
	$body.on('click', '.fabulous', function(){
		judgeUser(() => {
			var This = this;
			var $this = $(This);
			var $i = $this.find('i');
			var data = {
				articleId : $body[0].dataset.articleId,
			};
			try {
				data.to = $(This).parents('.comment-content-list')[0].dataset.id;
			} catch (e) {}
			$.ajax({
				url : '/article/fabulous',
				type : 'post',
				data : data,
				success : function(data){
					if (data.success) {
						if ($this.hasClass('on')) {
							$this.removeClass('on')
							$i.html(parseInt($i.html()) - 1)
						} else {
							$this.addClass('on')
							$i.html(parseInt($i.html()) + 1)
						}
					} else {
						alert('点赞失败！');
					}
				},
				error : function(){
					alert('点赞失败！');
				}
			});
		});
	});
})();