function getXHR(url) {
	return new Promise(function(resolve, reject) {
		var req = new XMLHttpRequest();
		req.open('GET', url);
		req.onload = function() {
			if (req.status == 200) {
				resolve(req.response);
			} else {
				reject(Error(req.statusText));
			}
		};
		req.onerror = function() {
			reject(Error("Network Error"));
		};
		req.send();
	});
};

function parseDate(itemDate) {
	itemDate = itemDate.split('T');
	itemDate = itemDate[0].split('-');
	itemDate = parseMonth(itemDate[1]) + ' ' + parseInt(itemDate[2]) + ', ' + itemDate[0];
	return itemDate;
};

function parseMonth(month) {
	if (month == '01') {
		return 'January';
	} else if (month == '02') {
		return 'February';
	} else if (month == '03') {
		return 'March';
	} else if (month == '04') {
		return 'April';
	} else if (month == '05') {
		return 'May';
	} else if (month == '06') {
		return 'June';
	} else if (month == '07') {
		return 'July';
	} else if (month == '08') {
		return 'August';
	} else if (month == '09') {
		return 'September';
	} else if (month == '10') {
		return 'October';
	} else if (month == '11') {
		return 'November';
	} else if (month == '12') {
		return 'December';
	};
};

function parseURL(linkURL) {
	linkURL = linkURL.replace(/(\r\n|\n|\r)/gm,"");
	linkURL = linkURL.split('<link>');
	linkURL = linkURL[1].split('<description>');
	return linkURL[0];
};

function xmlToJson(xml) {
	var obj = [];
	$(xml).find('item').each(function(i) {
		obj.push({
			"title": $(this).find('title').text(),
			"link": parseURL($(this).html()),
			"description": $(this).find('description').text(),
			"pubDate": parseDate($(this).find('pubDate').text()),
			"media": $(this).find('media\\:content, content').attr('url'),
			"id": i+1
		});
	});		
	return obj;
};

var RecipeLayout = React.createClass({
	doSearch: function(queryText) {
		var queryResult = [];
		this.props.recipes.forEach(function(recipe) {
			if (recipe.title.toLowerCase().indexOf(queryText) != -1 || recipe.description.toLowerCase().indexOf(queryText) != -1) {
				queryResult.push(recipe);
			};
		});
		this.setState({
			query: queryText,
			filteredRecipes: queryResult
		});
	},
	getInitialState: function() {
		return {
			query: '',
			filteredRecipes: this.props.recipes
		};
	},
	render: function() {
		var recipes = this.props.recipes;
		return (
			<main>
				<header>
					<SearchForm query={this.state.query} doSearch={this.doSearch} />
				</header>
				<RecipeList recipes={this.state.filteredRecipes} />					    
			</main>
		);
	}
});

var RecipeList = React.createClass({
	render: function() {
		return (
			<ul className="recipeList">
				{
					this.props.recipes.map(function(recipe) {
						return (
							<li className="recipeListItem" key={recipe.id}>
								<h2 className="recipeTitle">
									<a href={recipe.link} className="recipeTitleLink">{recipe.title}</a>
								</h2>
								<p className="recipeDate">Published on {recipe.pubDate}</p>
								<a href={recipe.link}><img src={recipe.media} className="recipeImg" alt="A picture of {recipe.title}" /></a>
								<p className="recipeDescription">{recipe.description}</p>
							</li>
						);
					})
				}
			</ul>
		);
	}
});

var SearchForm = React.createClass({
	doSearch: function() {
		var query = this.refs.searchRecipesInput.getDOMNode().value;
		this.props.doSearch(query);
	},
	handleSubmit: function() {
		return false;
	},
	resetSearch: function() {
		this.props.doSearch('');
	},
	render: function() {
		return (
			<form id="searchRecipesForm" onSubmit={this.handleSubmit}>
				<label for="searchRecipesInput">Search Recipes</label>
				<input type="text" id="searchRecipesInput" placeholder="Search" ref="searchRecipesInput" value={this.props.query} onChange={this.doSearch} />
				<input type="button" className="formButton" value="Reset Search" onClick={this.resetSearch} />
			</form>
		);
	}
});

getXHR('http://www.goodtoknow.co.uk/feeds/recipes.rss').then(function(response) {
	$('.preloadAnimation').addClass('hide');
	var recipes = xmlToJson(response);
	React.render(				    
		<RecipeLayout recipes={recipes} />,
		document.querySelector('.recipes')
	);
	$('.recipes').addClass('show');
}, function(error) {
  console.error(error);
});
