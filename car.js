/**
 * 汽车类
 */
class Car{
    constructor(x,y,width,height,controlType,maxSpeed=3){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;
        this.angle = 0;
        this.damaged = false;

        // 其他汽车不需要灯光感知
        if(controlType!="DUMMY"){
            this.sensor = new Sensor(this);
        }
        // this.sensor = new Sensor(this);
        this.controls = new Controls(controlType);
    }

    // 更新汽车状态
    update(roadBorders,traffic){
        if(!this.damaged){
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders,traffic);
        }
        if(this.sensor){
            this.sensor.update(roadBorders,traffic);
        }
        
        
    }

    #assessDamage(roadBorders,traffic){
        for(let i =0;i<roadBorders.length;i++){
            if(polysIntersect(this.polygon,roadBorders[i])){  // utils.js function
                return true;
            }
        }
        for(let i =0;i<traffic.length;i++){
            if(polysIntersect(this.polygon,traffic[i].polygon)){  // utils.js function
                return true;
            }
        }
        return false;
    }

    #createPolygon(){
        const points = [];  // 汽车的四个角 坐标
        const rad = Math.hypot(this.width,this.height)/2;
        const alpha = Math.atan2(this.width,this.height);
        points.push({
            x:this.x - Math.sin(this.angle - alpha)*rad,
            y:this.y - Math.cos(this.angle - alpha)*rad
        });
        points.push({
            x:this.x - Math.sin(this.angle + alpha)*rad,
            y:this.y - Math.cos(this.angle + alpha)*rad
        });
        points.push({
            x:this.x - Math.sin(Math.PI + this.angle - alpha)*rad,
            y:this.y - Math.cos(Math.PI + this.angle - alpha)*rad
        });
        points.push({
            x:this.x - Math.sin(Math.PI + this.angle + alpha)*rad,
            y:this.y - Math.cos(Math.PI + this.angle + alpha)*rad
        });
        return points;
    }

    // 汽车移动 属性改变
    #move(){
        // 前后移动
        if(this.controls.forward){
            this.speed += this.acceleration;
        }
        if(this.controls.reverse){
            this.speed -= this.acceleration;
        }

        // 前后移动速度控制
        if(this.speed > this.maxSpeed){
            this.speed = this.maxSpeed;
        }
        if(this.speed < -this.maxSpeed/2){  // 负速度表示向后，除2是为了不让后退速度过大
            this.speed = -this.maxSpeed/2;
        }

        if(this.speed > 0){
            this.speed -= this.friction;
        }
        if(this.speed < 0){
            this.speed += this.friction;
        }
        if(Math.abs(this.speed) < this.friction){  // 无操作时有略微的移动，清除速度
            this.speed = 0;
        }

        // 左右移动
        // if(this.controls.left){
        //     this.angle += 0.03;
        // }
        // if(this.controls.right){
        //     this.angle -= 0.03;
        // }

        // 解决以上注释代码：向后移动时，左右与现实不一致
        if(this.speed != 0){
            const flip = this.speed >0 ? 1 : -1;
            if(this.controls.left){
                this.angle += 0.03 * flip;
            }
            if(this.controls.right){
                this.angle -= 0.03 * flip;
            }
        }

        this.x -= Math.sin(this.angle)*this.speed;  // 当只向前/向后时如果有角度，需要向那个角度前进/后退
        this.y -= Math.cos(this.angle)*this.speed;
    }

    // 将汽车画在画布上
    draw(ctx,color){
        // ctx.save();
        // ctx.translate(this.x,this.y);
        // ctx.rotate(-this.angle);

        // ctx.beginPath();
        // ctx.rect(
        //     - this.width/2,
        //     - this.height/2,
        //     this.width,
        //     this.height
        // );
        // ctx.fill();

        // ctx.restore();

        if(this.damaged){
            ctx.fillStyle = "gray";
        }else{
            ctx.fillStyle = color;
        }

        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x,this.polygon[0].y);
        for(let i = 1;i<this.polygon.length;i++){
            ctx.lineTo(this.polygon[i].x,this.polygon[i].y);
        }
        ctx.fill();  // 等于注释掉的

        if(this.sensor){
            this.sensor.draw(ctx);
        }
        
    }
}