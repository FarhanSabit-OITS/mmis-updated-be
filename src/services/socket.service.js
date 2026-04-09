const { Server } = require('socket.io');

class SocketService {
    constructor() {
        this.io = null;
    }

    /**
     * Initializes the socket.io server instance
     * @param {Object} server HTTP Server instance
     */
    init(server) {
        this.io = new Server(server, {
            cors: {
                origin: "*", // Adjust in production
                methods: ["GET", "POST", "PUT"]
            }
        });

        this.io.on('connection', (socket) => {
            console.log(`[Socket] Client connected: ${socket.id}`);

            // A user joins their personal room based on their userId
            socket.on('join_room', (userId) => {
                if (userId) {
                    socket.join(userId);
                    console.log(`[Socket] User ${userId} joined their personal room`);
                }
            });

            // Admins join market-specific rooms
            socket.on('join_market', (marketId) => {
                if (marketId) {
                    socket.join(`market_${marketId}`);
                    console.log(`[Socket] Joined market room: market_${marketId}`);
                }
            });

            socket.on('disconnect', () => {
                console.log(`[Socket] Client disconnected: ${socket.id}`);
            });
        });
    }

    /**
     * Emits an event to a specific user
     * @param {String} userId Target user's ID
     * @param {String} event Event name
     * @param {Object} payload Event data
     */
    emitToUser(userId, event, payload) {
        if (this.io && userId) {
            this.io.to(userId).emit(event, payload);
        }
    }

    /**
     * Emits an event to all users subscribed to a market
     * @param {String} marketId Target Market ID
     * @param {String} event Event name
     * @param {Object} payload Event data
     */
    emitToMarket(marketId, event, payload) {
        if (this.io && marketId) {
            this.io.to(`market_${marketId}`).emit(event, payload);
        }
    }

    /**
     * Broadcast an alert universally (e.g. System down)
     */
    broadcast(event, payload) {
        if (this.io) {
            this.io.emit(event, payload);
        }
    }
}

module.exports = new SocketService();
