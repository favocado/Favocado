isDistinct = 1
//isDistinct=1 -> dont push same object-type to list

function getRelativeList(myList)
{
	ListRelative = {}
	for(key in myList)
	{
		ListRelative[key] = []
		// get all relative objects in properties
		properties = myList[key].properties
		for(property in properties)
		{
			if(isDistinct == 1)
			{
				if(ListRelative[key].indexOf(properties[property].type.replace("_Ar",""))  == -1)
				{
					ListRelative[key].push(properties[property].type.replace("_Ar",""))
				}
			}
			else ListRelative[key].push(properties[property].type.replace("_Ar",""))
		}
		// get all relative objects in methods (args, return value)
		methods = myList[key].methods
		for(method in methods)
		{
			var mt_arr = methods[method]
			for(mt in mt_arr)
			{
				for(var arg in mt_arr[mt].args) //args
				{

					var realType = getRealType(mt_arr[mt].args[arg])
					if(isDistinct == 1) 
					{
						if(ListRelative[key].indexOf(realType)  == -1 & myList.hasOwnProperty(realType))
						{
							ListRelative[key].push(realType)
						}
					}
					else
					{
						if(myList.hasOwnProperty(realType))
							ListRelative[key].push(realType)
					} 
				}

				var ret_type = mt_arr[mt].type; // return value ; maybe object or string
				if(typeof(ret_type) == "string")
				{
					var realType = getRealType(ret_type)
					if(ret_type.indexOf("_MAP_")!= -1 )
					{
						ListRelative[key].push(ret_type.split("_MAP_"))
					}

					if(isDistinct == 1) 
					{
						if(ListRelative[key].indexOf(realType)  == -1 & myList.hasOwnProperty(realType))
						{
							ListRelative[key].push(realType)
						}
					}
					else
					{
						if(myList.hasOwnProperty(realType))
							ListRelative[key].push(realType)
					} 
				}
				else // (typeof(ret_type) == "object") : {valie1: string, value2: int}
				{
					for(var ret_key in ret_type)
					{
						var realType = getRealType(ret_type[ret_key])
						if(ret_type[ret_key].indexOf("_MAP_") != -1 )
						{
							ListRelative[key].push(ret_type[ret_key].split("_MAP_"))
						}
						// if(!myList.hasOwnProperty(realType))
						// {
						// 	console.log(key)
						// 	console.log(realType)
						// }
						if(isDistinct == 1) 
						{
							if(ListRelative[key].indexOf(realType)  == -1 & myList.hasOwnProperty(realType))
							{
								ListRelative[key].push(realType)
							}
						}
						else
						{
							if(myList.hasOwnProperty(realType))
								ListRelative[key].push(realType)
						} 
					}
				}
			}
		}
	}
	return ListRelative
}

function countDuplicates(ListData)
{
	var result = []
	if(ListData.length == 0)
		return result;
	ListData.sort()
	var start = 0
	tmp = ListData[start]
	for(i = 0; i<= ListData.length; i++)
	{
	
		if(ListData[i] != tmp)
		{
			result[tmp] = i -start
			start = i
			tmp = ListData[i]
		}
	}

	return result
}

function calculatePercentage(ListRelative)
{
	var List_percentage = {}
	for(key in ListRelative)
	{
		List_percentage[key] = countDuplicates(ListRelative[key])
	}
	return List_percentage
}

function checkInList(type1, type2, ListPair)
{
	if(type1 == type2) return true
	for(i in ListPair)
	{
		if(ListPair[i][type1] == type2)
		{
			return true
		}

	}
	return false
}

function getPairList(myList)
{
	ListRelative = getRelativeList(myList)
	List_percentage = calculatePercentage(ListRelative)
	var count = 0
	ListPair = []
	for(key in List_percentage)
	{
		if(Object.keys(List_percentage[key]) == 0)
			continue;
		else
		{
			for(k in List_percentage[key])
			{

				if(Object.keys(myList).indexOf(k) != -1) // only binding object
				{
					if(key.localeCompare(k) == -1)
					{
						if(!checkInList(key, k , ListPair))
							ListPair.push({ [key]:k})
					}
					else
					{

						if(!checkInList(k, key , ListPair))
							ListPair.push({[k]:key})
					}
				}

			}
		}
	}	
	return ListPair

}

function exportCVS(myList, ListRelative){

	List_percentage = calculatePercentage(ListRelative)
	var str = ""
	for(i in List_percentage)
	{
		for(k in List_percentage[i])
		{
			if(i == k) continue
			if(Object.keys(myList).indexOf(k) != -1)
			{
				str += '"'+i+ '", '
				str += '"'+k+ '", '+'"'+List_percentage[i][k]+'"\n'
			}
		}
	}
	console.log(str)
}


// console.log(getRelativeList(ListMojoObject))
// console.log(getPairList(ListMojoObject))
// calculatePairNumber(List_percentage)
// console.log(List_percentage)