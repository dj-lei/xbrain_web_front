import * as d3 from "d3"
import Common from './common'
import SymbolEditor from '../components/common/symbol-editor.vue'
import { dsv } from "d3"

export default{
  copyElm (elm) {
    if (elm !== '') {
      let clipboard = {
        data: elm,
        count: 0
      }
      console.log("copy")
      console.log(clipboard.data)
      return clipboard
    }
  },
  pasteElm (clipboard, svg, id, hexa, extra) {
    console.log("paste")
    // console.log(clipboard.data.attr("dom_type"))
    let elm = ''
    if (extra){
      console.log(extra)
      elm = extra
    } else {
      elm = clipboard.data
      clipboard.count++
    }
    let the_dom_type = elm.attr("dom_type")
    if (the_dom_type === "text"){
      svg.append(elm.attr("dom_type"))
         .attr("id", id)
         .attr("dom_type", the_dom_type)
         .attr("x", parseInt(elm.attr("x")) + 10 * clipboard.count)
         .attr("y", parseInt(elm.attr("y")) - 10 * clipboard.count)
         .attr("fill", elm.attr("fill"))
         .attr("font-size", elm.attr("font-size"))
         .attr("transform", elm.attr("transform"))
         .text(elm.text())
    } else if (the_dom_type === "path"){
      let points = elm.attr("d").match(/([0-9+-]+ [0-9+-]+|[A-Za-z])/g)
      let result = []
      points.forEach((point) => {
        if (point.length > 1){
          result.push((parseInt(point.split(" ")[0]) + 10 * clipboard.count).toString()+' '+(parseInt(point.split(" ")[1]) - 10 * clipboard.count).toString() + " ")
        }else{
          result.push(point)
        }
      })
      svg.append(the_dom_type)
         .attr("id", id)
         .attr("d", result.join(''))
         .attr("dom_type", the_dom_type)
         .attr("transform", elm.attr("transform"))
         .style("fill", elm.style("fill"))
         .style('stroke', elm.style("stroke"))
         .style('stroke-width', elm.style("stroke-width"))
    } else if (the_dom_type === "polygon" || the_dom_type === "rectangle"){
      let points = elm.attr("points").split(" ")
      let result = []
      points.forEach((point) => {
        result.push((parseInt(point.split(",")[0]) + 10 * clipboard.count).toString()+','+(parseInt(point.split(",")[1]) - 10 * clipboard.count).toString())
      })
      svg.append('polygon')
         .attr("id", id)
         .attr("dom_type", the_dom_type)
         .attr("points", result.join(' '))
         .attr("transform", elm.attr("transform"))
         .style("fill", elm.style("fill"))
         .style('stroke', elm.style("stroke"))
         .style('stroke-width', elm.style("stroke-width"))
    } 
    // else if (the_dom_type === "rectangle"){
    //   let x = parseInt(elm.attr("x")) + 10 * clipboard.count
    //   let y = parseInt(elm.attr("y")) - 10 * clipboard.count
    //   svg.append('rect')
    //      .attr("id", id)
    //      .attr("dom_type", the_dom_type)
    //      .attr("x", x)
    //      .attr("y", y)
    //      .attr("width", elm.attr("width"))
    //      .attr("height", elm.attr("height"))
    //      .attr("transform", elm.attr("transform"))
    //      .style("fill", elm.style("fill"))
    //      .style('stroke', elm.style("stroke"))
    //      .style('stroke-width', elm.style("stroke-width"))
    // } 
    else if (the_dom_type === "circle"){
      svg.append('ellipse')
        .attr("id", id)
        .attr("dom_type", the_dom_type)
        .attr("cx", parseInt(elm.attr("cx")) + 10 * clipboard.count)
        .attr("cy", parseInt(elm.attr("cy")) - 10 * clipboard.count)
        .attr("rx", elm.attr("rx"))
        .attr("ry", elm.attr("ry"))
        // .attr("r", elm.attr("r"))
        .attr("transform", elm.attr("transform"))
        .style("fill", elm.style("fill"))
        .style("stroke", elm.style("stroke"))
        .style("stroke-width", elm.style("stroke-width"))
    } else if (the_dom_type === "data"){
      let newId = id + "_" + elm.select("span").attr("id").slice(-1)
      let newName = elm.select("span").attr("bind_name")
      let newValue = elm.select("span").attr("bind_value")
      let newType = elm.select("span").attr("bind_type")
      let newRange = elm.select("span").attr("bind_range")
      let newColor = elm.select("span").attr("style").slice(7)
      if (!newRange){
        newRange = '""'
      }
      svg.append("foreignObject")
         .attr("id", id)
         .attr("dom_type", the_dom_type)
         .attr("x", parseInt(elm.attr("x")) + 10 * clipboard.count)
         .attr("y", parseInt(elm.attr("y")) - 10 * clipboard.count)
         .attr("width", 150)
         .attr("height", 50)
         .attr("transform", elm.attr("transform"))
         .html('<div xmlns="http://www.w3.org/1999/xhtml"> <span id='+newId+' bind_name='+newName+' bind_value='+newValue+' bind_type='+newType+' bind_range='+newRange+' style="color: '+newColor+'">'+newName+":"+newValue+'</span> </div>')//
    }
  },
  updateScale(elm, x, y, s_scale, w_scale, h_scale, init_font_size, init_path_points, init_polygon_points, init_rec_points, init_rec_width, init_rec_height, init_circle_r_x, init_circle_r_y){
    // 是否考虑左上角位置不变？
    let scale = 0
    x = parseInt(x)
    y = parseInt(y)
    if (x && y){
      scale = parseInt(s_scale)
    } else if(x && !y){
      scale = parseInt(w_scale)
    } else if(!x && y){
      scale = parseInt(h_scale)
    }
    if (elm.attr("dom_type") === 'text'){
      let new_size = Math.round(parseInt(init_font_size) * (1 + 0.01 * parseInt(scale)))
      elm.attr("font-size", new_size)
    }else if (elm.attr("dom_type") === 'path'){
      let points = init_path_points.match(/([0-9+-]+ [0-9+-]+|[A-Za-z])/g)
      let result = []
      points.forEach((point) => {
        if (point.length > 1){
          result.push((Math.round(parseInt(point.split(" ")[0]) * (1 + 0.01 * x * parseInt(scale)))).toString()+' '+(Math.round(parseInt(point.split(" ")[1]) * (1 + 0.01 * y * parseInt(scale)))).toString() + " ")
        }else{
          result.push(point)
        }
      })
      elm.attr("d", result.join(''))
    }else if(elm.attr("dom_type") === 'polygon'){
      let res_points = ''
      let points = init_polygon_points.split(" ")
      let result = []
      points.forEach((point) => {
        result.push((Math.round(parseInt(point.split(",")[0]) * (1 + 0.01 * x * parseInt(scale)))).toString()+','+(Math.round(parseInt(point.split(",")[1]) * (1 + 0.01 * y * parseInt(scale)))).toString())
      })
      res_points = result.join(' ')
      elm.attr("points", res_points)
    }else if(elm.attr("dom_type") === 'rectangle'){
      let res_points = ''
      let points = init_rec_points.split(" ")
      let result = []
      points.forEach((point) => {
        result.push((Math.round(parseInt(point.split(",")[0]) * (1 + 0.01 * x * parseInt(scale)))).toString()+','+(Math.round(parseInt(point.split(",")[1]) * (1 + 0.01 * y * parseInt(scale)))).toString())
      })
      res_points = result.join(' ')
      elm.attr("points", res_points)
      // let width = Math.round(parseInt(init_rec_width) * (1 + 0.01 * x *  parseInt(scale)))
      // let height = Math.round(parseInt(init_rec_height) * (1 + 0.01 * y * parseInt(scale)))
      // elm.attr("width", width)
      //    .attr("height", height)
    }else if(elm.attr("dom_type") === 'circle'){
      elm.attr("rx", Math.round(parseInt(init_circle_r_x) * (1 + 0.01 * x * parseInt(scale))))
         .attr("ry", Math.round(parseInt(init_circle_r_y) * (1 + 0.01 * y * parseInt(scale))))
    }else if(elm.attr("dom_type") === 'data'){
      let transform = elm.attr("transform")
      let new_translate = transform.split(" ")[0]
      let new_scale = transform.split(" ")[1].split("(")[1].split(")")[0]
      console.log(new_scale)
      let res = (parseInt(new_scale) * (1 + 0.01 * parseInt(scale)))
      if (res < 1) res = 1
      else if (res > 10) res = 10
      elm.attr("transform", `${new_translate} scale(${res})`)
    }
  },
  Rotate(elm, rotate){
    // if (elm.attr("dom_type") === 'rectangle'){
    //   let t = elm.attr("transform")
    //   elm.attr("transform", `${t} rotate(${rotate}, ${parseInt(elm.attr("x")) + elm.attr("width") / 2} ${parseInt(elm.attr("y")) + elm.attr("height") / 2})`)
    // } else 
    if (elm.attr("dom_type") === 'circle'){
      let t = elm.attr("transform")
      elm.attr("transform", `${t} rotate(${rotate}, ${parseInt(elm.attr("cx"))} ${parseInt(elm.attr("cy"))})`)
    } else if (elm.attr("dom_type") === 'text'){
      let t = elm.attr("transform")
      elm.attr("transform", `${t} rotate(${rotate}, ${parseInt(elm.attr("x"))} ${parseInt(elm.attr("y"))})`)
    } else if (elm.attr("dom_type") === 'data'){
      let t = elm.attr("transform")
      elm.attr("transform", `${t} rotate(${rotate}, ${parseInt(elm.attr("x"))} ${parseInt(elm.attr("y"))})`)
    } else if (elm.attr("dom_type") === 'path'){
      let t = elm.attr("transform")
      let points = elm.attr("d").match(/([0-9+-]+ [0-9+-]+|[A-Za-z])/g)
      let x = []
      let y = []
      points.forEach((point) => {
        if (point.length > 1){
          x.push(parseInt(point.split(" ")[0]))
          y.push(parseInt(point.split(" ")[1]))
        }
      })
      let r_x = (Math.min.apply(null,x) + Math.max.apply(null,x)) / 2
      let r_y = (Math.min.apply(null,y) + Math.max.apply(null,y)) / 2
      elm.attr("transform", `${t} rotate(${rotate}, ${r_x} ${r_y})`)
    } else if (elm.attr("dom_type") === 'polygon' || elm.attr("dom_type") === 'rectangle'){
      let t = elm.attr("transform")
      let x = []
      let y = []
      let points = elm.attr("points").split(" ")
      points.forEach((point) => {
        x.push(parseInt(point.split(",")[0]))
        y.push(parseInt(point.split(",")[1]))
      })
      let r_x = (Math.min.apply(null,x) + Math.max.apply(null,x)) / 2
      let r_y = (Math.min.apply(null,y) + Math.max.apply(null,y)) / 2
      elm.attr("transform", `${t} rotate(${rotate}, ${r_x} ${r_y})`)
    }
  },
  saveLog(state, svg){
    let serializer = new XMLSerializer()
    let source = serializer.serializeToString(svg.node())
    let url = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(source)
    if(state.current > -1){
      if(state.svgLog[state.current] === url) return // drag但没挪动 不存入
      // 再添加一个-只是选中颜色变灰不存入 怎么弄？
    }
    if (state.current == state.svgLog.length - 1){ // current处于svgLog的最新状态
      if(state.svgLog.length < state.limit){ // limit: 5
        state.svgLog.push(url)
        state.current++
        //console.log(state.svgLog.length,state.current,url)
      }else{
        state.svgLog.shift()
        state.svgLog.push(url)
        //console.log(state.svgLog.length,state.current,url)
      }
    }else{ // current处于svgLog的历史状态 舍弃之后的log 开启新的分支
      state.svgLog.length = state.current + 1
      if(state.svgLog.length < state.limit){ // limit: 5
        state.svgLog.push(url)
        state.current++
        //console.log(state.svgLog.length,state.current,url)
      }else{
        svgLog.shift()
        state.svgLog.push(url)
        //console.log(state.svgLog.length,state.current,url)
      }
    }
  },
  brushed(event, svg){
    let _this = this
    if(event.selection){
      let brush = []
      let unbrush = []
      let [[x0, y0], [x1, y1]] = event.selection
      svg.selectAll("*").each(function(d,i){
        // if(d3.select(this).attr("dom_type") === 'rectangle'){
        //   console.log("1")
        //   let min_x = d3.select(this).attr("x")
        //   let max_x = parseInt(d3.select(this).attr("x"))+parseInt(d3.select(this).attr("width"))
        //   let min_y = d3.select(this).attr("y")
        //   let max_y = parseInt(d3.select(this).attr("y"))+parseInt(d3.select(this).attr("height"))
        //   if(x0<=min_x && max_x<=x1 && y0<=min_y && max_y<=y1){
        //     d3.select(this).style("stroke", Common.colorRGBtoHex(d3.select(this).style("stroke"))+'20')
        //     brush.push(d3.select(this).attr("id"))
        //   }else{
        //     d3.select(this).style("stroke", Common.colorRGBtoHex(d3.select(this).style("stroke")).slice(0,7))
        //     unbrush.push(d3.select(this).attr("id"))
        //   }
        // }else 
        if (d3.select(this).attr("dom_type") === 'text'){//
          // console.log("2")
          if(x0<=d3.select(this).attr("x") && d3.select(this).attr("x")<=x1 && y0<=d3.select(this).attr("y") && d3.select(this).attr("y")<=y1){
            d3.select(this).attr("fill", d3.select(this).attr("fill")+'20')
            brush.push(d3.select(this).attr("id"))
          }else{
            d3.select(this).attr("fill", d3.select(this).attr("fill").slice(0,7))
            unbrush.push(d3.select(this).attr("id"))
          }
        }else if (d3.select(this).attr("dom_type") === 'data'){
          // console.log("3")
          if(x0<=d3.select(this).attr("x") && d3.select(this).attr("x")<=x1 && y0<=d3.select(this).attr("y") && d3.select(this).attr("y")<=y1){
            d3.select(this).select('span').attr("style", "color: "+d3.select(this).select('span').attr("style").split(' ')[1]+'20')
            brush.push(d3.select(this).attr("id"))
          }else{
            d3.select(this).select('span').attr("style", "color: "+d3.select(this).select('span').attr("style").split(' ')[1].slice(0,7))
            unbrush.push(d3.select(this).attr("id"))
          }
        }else if (d3.select(this).attr("dom_type") === 'circle'){
          // console.log("4")
          if(d3.select(this).attr("cx")>=x0 && d3.select(this).attr("cx")<=x1 && d3.select(this).attr("cy")>=y0 && d3.select(this).attr("cy")<=y1){
            d3.select(this).style("stroke", Common.colorRGBtoHex(d3.select(this).style("stroke"))+'20')
            brush.push(d3.select(this).attr("id"))
          } else {
            d3.select(this).style("stroke", Common.colorRGBtoHex(d3.select(this).style("stroke")).slice(0,7))
            unbrush.push(d3.select(this).attr("id"))
          }
        } else if (d3.select(this).attr("dom_type") === 'path'){
          // console.log("5")
          let points = d3.select(this).attr("d").match(/([0-9+-]+ [0-9+-]+|[A-Za-z])/g)
          let x = []
          let y = []
          points.forEach((point) => {
            if (point.length > 1){
              x.push(parseInt(point.split(" ")[0]))
              y.push(parseInt(point.split(" ")[1]))
            }
          })
          let min_x = Math.min.apply(null,x)
          let max_x = Math.max.apply(null,x)
          let min_y = Math.min.apply(null,y)
          let max_y = Math.max.apply(null,y)
          if(x0<=min_x && max_x<=x1 && y0<=min_y && max_y<=y1){
            d3.select(this).style("stroke", Common.colorRGBtoHex(d3.select(this).style("stroke"))+'20')
            brush.push(d3.select(this).attr("id"))
          }else{
            d3.select(this).style("stroke", Common.colorRGBtoHex(d3.select(this).style("stroke")).slice(0,7))
            unbrush.push(d3.select(this).attr("id"))
          }
        } else if (d3.select(this).attr("dom_type") === 'polygon' || d3.select(this).attr("dom_type") === 'rectangle'){
          // console.log("6")
          let x = []
          let y = []
          let points = d3.select(this).attr("points").split(" ")
          points.forEach((point) => {
            x.push(parseInt(point.split(",")[0]))
            y.push(parseInt(point.split(",")[1]))
          })
          let min_x = Math.min.apply(null,x)
          let max_x = Math.max.apply(null,x)
          let min_y = Math.min.apply(null,y)
          let max_y = Math.max.apply(null,y)
          if(x0<=min_x && max_x<=x1 && y0<=min_y && max_y<=y1){
            d3.select(this).style("stroke", Common.colorRGBtoHex(d3.select(this).style("stroke"))+'20')
            brush.push(d3.select(this).attr("id"))
          }else{
            d3.select(this).style("stroke", Common.colorRGBtoHex(d3.select(this).style("stroke")).slice(0,7))
            unbrush.push(d3.select(this).attr("id"))
          }
        }
      })
      return brush
    }
  }
}
//////////////////
//ctrl+v 整体复制的另一种思路
// let xmlns = _this.clipboard.data.attr("xmlns")
// let newid = _this.clipboard.data.attr("id").slice(0,-1)+_this.instance_num
// _this.instance_num = _this.instance_num + 1
// d3.select("#new").append('g').attr("xmlns", xmlns).attr("id",newid).attr("dom_type",'g')
// _this.clipboard.data.selectAll('*').select(function() {
//   if(d3.select(this).attr("dom_type") !== "g"){
//     return this
//   }
// }).each(function(d, i) {
//   let id = _this.$common.generateUUID()
//   _this.$experience.pasteElm(_this.clipboard, d3.select("#"+newid), id, _this.hexa, d3.select(this))
//   //d3.select('#'+id).call(_this.drag(d3.select('#'+id)))//到这里 
// })
// _this.major_elms.forEach((elm) => {
//   d3.select('#'+newid).selectAll(elm).call(g => g.attr("id", newid).call(_this.drag(g)))
// })
////////////////